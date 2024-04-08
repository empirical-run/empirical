const scorers = require('./dist/index');
// const scorers = require('@empiricalrun/scorer');

module.exports = async (output, inputs) => {
  console.log(scorers.getScoringFn);
  const fn = scorers.getScoringFn({type: 'sql-syntax'});
  console.log(fn);

  return await fn({
    output: output
  })

  // console.log("inputs", inputs);
  // console.log("output", output);
  // const parsed = JSON.parse(output.value);
  // return [
  //   {
  //     name: "json-keys-gt-2",
  //     score: Object.keys(parsed).length >= 2 ? 1 : 0,
  //     message: "testing message",
  //   },
  // ];
};
