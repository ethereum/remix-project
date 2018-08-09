/**
  * Should be used to categorize different modules, main reason is to give users feedback if the modules
  * Produce exact results or have false positives and negatives in them
  * A further category could be approximate if some form of approximation is used
*/
module.exports = {
  EXACT: { hasFalsePositives: false, hasFalseNegatives: false, id: 'EXACT' },
  HEURISTIC: { hasFalsePositives: true, hasFalseNegatives: true, id: 'HEURI' }
}
