import modal

app = modal.App("modal-hackathon")


@app.function()
def square(value: int) -> int:
	return value * value


@app.local_entrypoint()
def main() -> None:
	print("Hello from Modal")
	result = square.remote(7)
	print(f"square(7) = {result}")


if __name__ == "__main__":
	print("Run this with: .venv/bin/modal run get_started.py")



