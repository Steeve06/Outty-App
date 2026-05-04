import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from 'firebase/firestore';

// @ts-expect-error - firebase module lacks type declarations
import { db } from '../firebase';
import { RootStackParamList } from '../../../../types';
import { useAuth } from '../../src/context/AuthContext';

const GREEN = '#2D9B6F';
const GREEN_LIGHT = '#E8F5EE';
const GREEN_DARK = '#1e7a54';

type MessagingScreenRouteProp = RouteProp<RootStackParamList, 'MessagingScreen'>;

type Message = {
  id: string;
  senderUid: string;
  text?: string;
  sentAt?: { seconds: number; nanoseconds: number } | Date | null;
  type?: 'text' | string;
  readBy?: string[];
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatTime(sentAt: Message['sentAt']): string {
  if (!sentAt) return '';
  const date =
    sentAt instanceof Date
      ? sentAt
      : new Date((sentAt as { seconds: number }).seconds * 1000);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateDivider(sentAt: Message['sentAt']): string {
  if (!sentAt) return '';
  const date =
    sentAt instanceof Date
      ? sentAt
      : new Date((sentAt as { seconds: number }).seconds * 1000);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'long', day: 'numeric' });
}

function isSameDay(a: Message['sentAt'], b: Message['sentAt']): boolean {
  if (!a || !b) return false;

  const dateA = a instanceof Date ? a : new Date((a as { seconds: number }).seconds * 1000);
  const dateB = b instanceof Date ? b : new Date((b as { seconds: number }).seconds * 1000);
  return dateA.toDateString() === dateB.toDateString();
}

export default function MessagingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<MessagingScreenRouteProp>();
  const { firebaseUser, userProfile } = useAuth();

  const currentUserUid = firebaseUser?.uid || userProfile?.uid;
  const conversationId = route.params.conversationId;
  // const otherUserUid = route.params.otherUserUid;
  const otherUserName = route.params.name || 'Chat';

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const flatListRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    if (!conversationId) {
      setInitialLoading(false);
      return;
    }

    const messagesQuery = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('sentAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messageList = snapshot.docs.map((messageDoc) => ({
          id: messageDoc.id,
          ...messageDoc.data(),
        })) as Message[];

        setMessages(messageList);
        setInitialLoading(false);
      },
      (error) => {
        console.error('Error listening to messages:', error);
        setInitialLoading(false);
      }
    );

    return () => unsubscribe();
  }, [conversationId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !conversationId || !currentUserUid) return;

    const trimmedMessage = messageInput.trim();
    setLoading(true);
    setMessageInput('');

    try {
      await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
        senderUid: currentUserUid,
        text: trimmedMessage,
        sentAt: serverTimestamp(),
        type: 'text',
        readBy: [currentUserUid],
      });

      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessageText: trimmedMessage,
        lastMessageAt: serverTimestamp(),
        lastMessageSenderUid: currentUserUid,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message.');
      setMessageInput(trimmedMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwn = item.senderUid === currentUserUid;
    const prevItem = index > 0 ? messages[index - 1] : null;
    const nextItem = index < messages.length - 1 ? messages[index + 1] : null;

    const showDateDivider = !prevItem || !isSameDay(prevItem.sentAt, item.sentAt);

    // Group bubbles — tighten spacing when consecutive messages from same sender
    const isGroupedWithPrev = prevItem && prevItem.senderUid === item.senderUid && !showDateDivider;
    const isGroupedWithNext = nextItem && nextItem.senderUid === item.senderUid &&
      isSameDay(item.sentAt, nextItem?.sentAt);

    const bubbleStyle = isOwn
      ? [
        styles.bubbleOwn,
        isGroupedWithPrev && styles.bubbleOwnGroupedTop,
        isGroupedWithNext && styles.bubbleOwnGroupedBottom,
      ]
      : [
        styles.bubbleOther,
        isGroupedWithPrev && styles.bubbleOtherGroupedTop,
        isGroupedWithNext && styles.bubbleOtherGroupedBottom,
      ];

    return (
      <>
        {showDateDivider && item.sentAt && (
          <View style={styles.dateDivider}>
            <View style={styles.dateLine} />
            <Text style={styles.dateText}>{formatDateDivider(item.sentAt)}</Text>
            <View style={styles.dateLine} />
          </View>
        )}

        <View
          style={[
            styles.messageRow,
            isOwn ? styles.messageRowOwn : styles.messageRowOther,
            { marginBottom: isGroupedWithNext ? 2 : 10 },
          ]}
        >
          {/* Avatar placeholder for other user — only show at end of group */}
          {!isOwn && (
            <View style={styles.avatarSlot}>
              {!isGroupedWithNext && (
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitials}>{getInitials(otherUserName)}</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.bubbleColumn}>
            <View style={bubbleStyle}>
              <Text style={isOwn ? styles.textOwn : styles.textOther}>
                {item.text || ''}
              </Text>
            </View>
            {/* Timestamp — only show at end of a group */}
            {!isGroupedWithNext && item.sentAt && (
              <Text style={[styles.timeLabel, isOwn ? styles.timeLabelOwn : styles.timeLabelOther]}>
                {formatTime(item.sentAt)}
              </Text>
            )}
          </View>
        </View>
      </>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Text style={styles.emptyIconText}>💬</Text>
      </View>
      <Text style={styles.emptyTitle}>Start the conversation</Text>
      <Text style={styles.emptySubtitle}>
        You matched with {otherUserName}. Say something nice!
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>{getInitials(otherUserName)}</Text>
          </View>
          <View>
            <Text style={styles.headerName}>{otherUserName}</Text>
          </View>
        </View>

        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {initialLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={GREEN} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={[
              styles.messagesList,
              messages.length === 0 && styles.messagesListEmpty,
            ]}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          />
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={messageInput}
            onChangeText={setMessageInput}
            placeholder="Message..."
            placeholderTextColor="#aaa"
            editable={!loading}
            multiline
            maxLength={1000}
          />

          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!messageInput.trim() || loading) && styles.sendBtnDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!messageInput.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.sendBtnIcon}>↑</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flex: { flex: 1 },

  // ── Header ──────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 36,
    color: GREEN,
    lineHeight: 40,
    marginTop: -4,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GREEN_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: GREEN,
  },
  headerAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: GREEN_DARK,
  },
  headerName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
  },
  headerStatus: {
    fontSize: 12,
    color: GREEN,
    marginTop: 1,
  },

  // ── Messages ─────────────────────────────────────────────
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  messagesListEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Date divider
  dateDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 10,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ececec',
  },
  dateText: {
    fontSize: 12,
    color: '#aaa',
    fontWeight: '500',
    paddingHorizontal: 4,
  },

  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  messageRowOwn: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },

  avatarSlot: {
    width: 34,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: GREEN_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 11,
    fontWeight: '700',
    color: GREEN_DARK,
  },

  bubbleColumn: {
    maxWidth: '72%',
  },

  // Own (outgoing) bubble
  bubbleOwn: {
    backgroundColor: GREEN,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderBottomRightRadius: 5,
  },
  bubbleOwnGroupedTop: {
    borderTopRightRadius: 8,
  },
  bubbleOwnGroupedBottom: {
    borderBottomRightRadius: 8,
  },

  // Other (incoming) bubble
  bubbleOther: {
    backgroundColor: '#f2f2f2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderBottomLeftRadius: 5,
  },
  bubbleOtherGroupedTop: {
    borderTopLeftRadius: 8,
  },
  bubbleOtherGroupedBottom: {
    borderBottomLeftRadius: 8,
  },

  textOwn: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
  },
  textOther: {
    color: '#1a1a1a',
    fontSize: 16,
    lineHeight: 22,
  },

  timeLabel: {
    fontSize: 11,
    color: '#bbb',
    marginTop: 4,
  },
  timeLabelOwn: {
    textAlign: 'right',
  },
  timeLabelOther: {
    textAlign: 'left',
    marginLeft: 4,
  },

  // ── Empty State ───────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: GREEN_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIconText: { fontSize: 32 },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },

  // ── Input Bar ─────────────────────────────────────────────
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 130,
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111',
    lineHeight: 22,
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  sendBtnDisabled: {
    backgroundColor: '#d0d0d0',
    shadowOpacity: 0,
    elevation: 0,
  },
  sendBtnIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
});