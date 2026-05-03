export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  MainTabs: undefined;
  MessagingScreen: {
    conversationId: string;
    otherUserUid?: string;
    name?: string;
  };
};

export type TabParamList = {
  Discover: undefined;
  Matches: undefined;
  Profile: undefined;
};