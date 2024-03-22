import nest_asyncio
from llama_index.core import SimpleDirectoryReader
from ragas.testset.generator import TestsetGenerator
from ragas.testset.evolutions import simple, reasoning, multi_context
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

nest_asyncio.apply()


def generate_dataset():
    # load documents
    reader = SimpleDirectoryReader("./arxiv-papers/", num_files_limit=30)
    documents = reader.load_data()

    # generator with openai models
    generator_llm = ChatOpenAI(model="gpt-3.5-turbo")
    critic_llm = ChatOpenAI(model="gpt-4-turbo-preview")
    embeddings = OpenAIEmbeddings()
    generator = TestsetGenerator.from_langchain(generator_llm, critic_llm, embeddings)

    distributions = {simple: 0.4, multi_context: 0.4, reasoning: 0.2}

    # generate testset
    testset = generator.generate_with_llamaindex_docs(documents, 2, distributions)
    test_df = testset.to_pandas()
    test_df.to_json(".empiricalrun/dataset.jsonl", orient="records", lines=True)


if __name__ == "__main__":
    generate_dataset()
