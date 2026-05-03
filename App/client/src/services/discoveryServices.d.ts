export interface UserProfile {
  id: string;
  uid: string;
  name?: string;
  age?: number;
  location?: string;
  bio?: string;
  [key: string]: string | number | boolean | undefined;
}

export declare function loadInitialQueue(currentUserUid: string): Promise<UserProfile[]>;
export declare function saveInteraction(
    currentUserUid: string,
    targetMatchUid: string,
    typeOfInteraction: 'like' | 'pass' | 'block'
): Promise<void>;
export declare function matchUsers(fromUid: string, toUid: string): Promise<void>;