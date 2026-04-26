const WORDS = [
  'apple', 'banana', 'cat', 'dog', 'elephant', 'flower', 'guitar', 'house', 'ice cream', 'jungle',
  'kangaroo', 'lion', 'mountain', 'night', 'ocean', 'piano', 'queen', 'river', 'sun', 'tree',
  'umbrella', 'violin', 'whale', 'xylophone', 'yacht', 'zebra', 'airplane', 'bicycle', 'computer', 'doctor',
  'earth', 'football', 'giraffe', 'helicopter', 'island', 'jacket', 'kite', 'laptop', 'moon', 'nurse',
  'orange', 'pizza', 'robot', 'ship', 'telescope', 'unicorn', 'volcano', 'windmill', 'yoga', 'zoo'
];

const getRandomWord = () => {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
};

const maskWord = (word) => {
  return word.split('').map(char => char === ' ' ? ' ' : '_').join(' ');
};

module.exports = {
  WORDS,
  getRandomWord,
  maskWord
};
