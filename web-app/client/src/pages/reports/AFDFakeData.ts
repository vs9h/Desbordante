export const data = {
  __typename: 'AFDResult',
  result: {
    __typename: 'AFDResult',
    threshold: 0.33,
    violatingRows: 1111,
    clustersTotalCount: 2,
  },
  clusterInfo: {
    __typename: 'AFDClusterInfo',
    size: 9,
    distinctRHSValues: 4,
    mostFrequentValue: 'Sausage',
    frequentness: 44,
    rows: [
      {
        isFrequent: true,
        index: 0,
        snippetRow: ['1', '22', 'Robin', 'Sausage'],
      },
      {
        isFrequent: true,
        index: 1,
        snippetRow: ['2', '22', 'Robin', 'Sausage'],
      },
      {
        isFrequent: true,
        index: 2,
        snippetRow: ['3', '22', 'Robin', 'Sausage'],
      },
      {
        isFrequent: true,
        index: 3,
        snippetRow: ['4', '22', 'Robin', 'Sausage'],
      },
      {
        isFrequent: false,
        index: 4,
        snippetRow: ['5', '22', 'Robin', 'Beer'],
      },
      {
        isFrequent: false,
        index: 5,
        snippetRow: ['6', '22', 'Robin', 'Cheese'],
      },
      {
        isFrequent: false,
        index: 6,
        snippetRow: ['7', '22', 'Robin', 'Beer'],
      },
      {
        isFrequent: false,
        index: 7,
        snippetRow: ['8', '22', 'Robin', 'Chocolate'],
      },
      {
        isFrequent: false,
        index: 8,
        snippetRow: ['9', '22', 'Robin', 'Chocolate'],
      },
    ],
  },
  header: ['Most Frequent', 'Id', 'Workshop', 'Chief', 'Product'],
};
