const scorers = require('./dist/index');
// const scorers = require('@empiricalrun/scorer');

module.exports = async (output, inputs) => {
  console.log(scorers.getScoringFn);
  const fn = scorers.getScoringFn({type: 'llm-faithfulness'});
  console.log(fn);

  return await fn({
    sample: { inputs },
    config: {
      type: 'llm-faithfulness', // TODO: why do i have to pass this
      context: "Delhi is a city in India. It is the capital of India.",
      claims: [
        "Delhi is hot", "Delhi is a place where people live"
      ]
    }
  })
};
