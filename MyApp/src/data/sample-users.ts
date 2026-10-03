/** Local stand-in for a user directory. Replace with a backend lookup later. */
export type SampleUser = {
  id: string;
  name: string;
  avatarUri: string | null;
};

export const SAMPLE_USERS: SampleUser[] = [
  { id: '48213907651', name: 'Jordan Lee', avatarUri: null },
  { id: '70391846225', name: 'Sam Rivera', avatarUri: null },
  { id: '15586402938', name: 'Priya Nair', avatarUri: null },
  { id: '93027416801', name: 'Chris Obi', avatarUri: null },
  { id: '36614279054', name: 'Mia Chen', avatarUri: null },
  { id: '82795031466', name: 'Lucas Brown', avatarUri: null },
];
