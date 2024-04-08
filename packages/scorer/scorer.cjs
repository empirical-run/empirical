module.exports = (output, inputs) => {
  const parsed = JSON.parse(output.value);
  return [
    {
      name: "json-keys-gt-2",
      score: Object.keys(parsed).length >= 2 ? 1 : 0,
      message: "testing message",
    },
  ];
};
