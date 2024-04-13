from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.llms.openai import OpenAI as LlamaOpenAI
from llama_index.core.node_parser import SentenceSplitter


def execute(inputs, parameters):
    # load documents
    question = inputs["question"]
    reader = SimpleDirectoryReader("./arxiv-papers/", num_files_limit=30)
    documents = reader.load_data()

    def build_query_engine(llm):
        splitter = SentenceSplitter(chunk_size=512)
        vector_index = VectorStoreIndex.from_documents(
            documents,
            transformations=[splitter],
        )
        query_engine = vector_index.as_query_engine(similarity_top_k=2, llm=llm)
        return query_engine

    query_engine = build_query_engine(
        llm=LlamaOpenAI(model=parameters.get("model", "gpt-3.5-turbo"))
    )
    response = query_engine.query(question)
    output = response.response
    contexts = [c.node.get_content() for c in response.source_nodes]
    return {
        "value": output,
        "metadata": {"contexts": contexts},
    }
