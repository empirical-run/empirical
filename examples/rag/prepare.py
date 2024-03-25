import os
from urllib.request import urlretrieve


def download_doc():
    file_name = "2403.10153.pdf"
    dataset_url = f"https://arxiv.org/pdf/{file_name}"
    destination_dir = "arxiv-papers"
    final_path = os.path.join(destination_dir, file_name)
    os.makedirs(destination_dir, exist_ok=True)
    urlretrieve(dataset_url, final_path)


if __name__ == "__main__":
    download_doc()
