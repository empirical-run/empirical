import os
import gzip
import shutil
from urllib.request import urlretrieve


def download_and_extract():
    dataset_url = (
        "https://github.com/openai/human-eval/raw/master/data/HumanEval.jsonl.gz"
    )
    destination_path = "HumanEval.jsonl.gz"
    final_path = os.path.join(".empiricalrun", "HumanEval.jsonl")
    urlretrieve(dataset_url, destination_path)
    os.makedirs(".empiricalrun", exist_ok=True)

    with gzip.open(destination_path, "rb") as f_in:
        with open(final_path, "wb") as f_out:
            shutil.copyfileobj(f_in, f_out)

    os.remove(destination_path)


if __name__ == "__main__":
    download_and_extract()
