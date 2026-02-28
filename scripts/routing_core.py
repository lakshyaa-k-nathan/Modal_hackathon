import math
import pandas as pd
import networkx as nx
import osmnx as ox
import h3
from shapely.geometry import box
import json
from datetime import datetime

# ------------------------
# Load risk table once
# ------------------------

H3_RESOLUTION = 9
DEFAULT_RISK = 0.0
LAMBDA_RISK = 0.6  # tune

def load_risk_lookup(path="../risk_table.parquet"):
    df = pd.read_parquet(path)
    return {
        (row.h3, int(row.hour_of_week)): float(row.risk)
        for row in df.itertuples(index=False)
    }

RISK_LOOKUP = load_risk_lookup()


# ------------------------
# Helper functions
# ------------------------

def bbox_from_points(lat1, lon1, lat2, lon2):
    dlat = abs(lat1 - lat2)
    dlon = abs(lon1 - lon2)
    dist_proxy = max(dlat, dlon)

    buffer = min(max(0.75 * dist_proxy + 0.015, 0.015), 0.06)

    north = max(lat1, lat2) + buffer
    south = min(lat1, lat2) - buffer
    east = max(lon1, lon2) + buffer
    west = min(lon1, lon2) - buffer

    return north, south, east, west


def edge_midpoint_latlon(G, u, v, data):
    geom = data.get("geometry", None)
    if geom is not None:
        mid = geom.interpolate(0.5, normalized=True)
        return float(mid.y), float(mid.x)

    uy, ux = G.nodes[u]["y"], G.nodes[u]["x"]
    vy, vx = G.nodes[v]["y"], G.nodes[v]["x"]
    return (uy + vy) / 2.0, (ux + vx) / 2.0


def annotate_graph(G, hour_of_week):
    for u, v, k, data in G.edges(keys=True, data=True):
        length = float(data.get("length", 1.0))

        lat, lon = edge_midpoint_latlon(G, u, v, data)
        cell = h3.latlng_to_cell(lat, lon, H3_RESOLUTION)

        risk = RISK_LOOKUP.get((cell, hour_of_week), DEFAULT_RISK)

        data["risk"] = risk
        data["cost"] = length * (1 + LAMBDA_RISK * risk)


def route_metrics(G, route):
    total_len = 0.0
    total_cost = 0.0
    risk_len = 0.0

    for a, b in zip(route[:-1], route[1:]):
        ed = G.get_edge_data(a, b)
        best_key = min(ed, key=lambda kk: float(ed[kk].get("cost", ed[kk].get("length", 1e18))))
        d = ed[best_key]

        L = float(d.get("length", 0.0))
        C = float(d.get("cost", L))
        R = float(d.get("risk", 0.0))

        total_len += L
        total_cost += C
        risk_len += R * L

    avg_risk = risk_len / max(total_len, 1e-9)

    return {
        "length_m": total_len,
        "avg_risk": avg_risk,
        "total_cost": total_cost
    }


def route_to_coords(G, route):
    return [
        [float(G.nodes[n]["y"]), float(G.nodes[n]["x"])]
        for n in route
    ]


# ------------------------
# MAIN FUNCTION
# ------------------------

def get_routes(origin_lat, origin_lon, dest_lat, dest_lon, hour_of_week, save_output=True, output_path="routes_output.json"):
    north, south, east, west = bbox_from_points(
        origin_lat, origin_lon, dest_lat, dest_lon
    )

    poly = box(west, south, east, north)
    G = ox.graph_from_polygon(poly, network_type="walk", simplify=True)
    G = ox.distance.add_edge_lengths(G)

    annotate_graph(G, hour_of_week)

    orig_node = ox.distance.nearest_nodes(G, X=origin_lon, Y=origin_lat)
    dest_node = ox.distance.nearest_nodes(G, X=dest_lon, Y=dest_lat)

    route_fast = nx.shortest_path(G, orig_node, dest_node, weight="length")
    route_safe = nx.shortest_path(G, orig_node, dest_node, weight="cost")

    m_fast = route_metrics(G, route_fast)
    m_safe = route_metrics(G, route_safe)

    result = {
        "metadata": {
            "origin": {"lat": origin_lat, "lon": origin_lon},
            "dest": {"lat": dest_lat, "lon": dest_lon},
            "hour_of_week": hour_of_week,
            "generated_at": datetime.utcnow().isoformat()
        },
        "fastest": {
            "coords": route_to_coords(G, route_fast),
            **m_fast
        },
        "safest": {
            "coords": route_to_coords(G, route_safe),
            **m_safe
        }
    }

    if save_output:
        with open(output_path, "w") as f:
            json.dump(result, f, indent=2)

    return result

get_routes(41.79960573825807, -87.59240156626738, 41.784529972951745, -87.60709202512507, hour_of_week=15)