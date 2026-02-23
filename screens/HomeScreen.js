import React, { useRef, useState } from 'react';
import { View, FlatList, StyleSheet, Image, TouchableOpacity, Text, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MotiView } from 'moti';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../context/ThemeContext';

const posts = [
  {
    id: 1,
    community: 'c/buildinpublic',
    author: 'Nikhila Shah',
    time: '7h',
    space: 'New Info Space',
    title: 'Fintech CTO Validation Session',
    content:
      'We have Demo Day in 2 weeks and our pitch deck needs work. Looking for founders/investors who can provide.',
    replies: 26,
    likes: 112,
    avatar: 'https://i.pravatar.cc/150?img=15',
    preview: {
      avatar: 'https://i.pravatar.cc/150?img=32',
      header: 'c/buildinpublic · Akash Agarwal · 7h',
      text: 'Our team just closed a $2M seed round! 🎉',
      meta: '26 replies · 112 likes',
    },
    replyAvatars: ['https://i.pravatar.cc/150?img=16', 'https://i.pravatar.cc/150?img=22'],
  },
  {
    id: 2,
    community: 'c/buildinpublic',
    author: 'Nikhila Shah',
    time: '7h',
    space: 'New Info Space',
    title: 'Just finished setting up my new home office! What do you think?',
    image: 'https://picsum.photos/id/1015/900/650',
    replies: 12,
    likes: 84,
    avatar: 'https://i.pravatar.cc/150?img=47',
    replyAvatars: ['https://i.pravatar.cc/150?img=41', 'https://i.pravatar.cc/150?img=56'],
  },
  {
    id: 3,
    community: 'c/buildinpublic',
    author: 'Alex Kim',
    time: '2h',
    space: 'New Info Space',
    title: 'Launching our new app today!',
    content: "Excited to share what we've built. Feedback welcome!",
    replies: 8,
    likes: 41,
    avatar: 'https://i.pravatar.cc/150?img=12',
    replyAvatars: ['https://i.pravatar.cc/150?img=13', 'https://i.pravatar.cc/150?img=14'],
  },
  {
    id: 4,
    community: 'c/buildinpublic',
    author: 'Riya Desai',
    time: '1h',
    space: 'New Info Space',
    title: 'Built a zero-to-one launch checklist, should I share template?',
    content:
      'Happy to post the exact checklist we used for internal launch review. It helped us cut last-minute bugs.',
    replies: 19,
    likes: 73,
    avatar: 'https://i.pravatar.cc/150?img=61',
    image: 'https://picsum.photos/id/1033/900/650',
    replyAvatars: ['https://i.pravatar.cc/150?img=18', 'https://i.pravatar.cc/150?img=19'],
  },
  {
    id: 5,
    community: 'c/buildinpublic',
    author: 'Harsh Patel',
    time: '58m',
    space: 'New Info Space',
    title: 'Anyone here using AI for support ticket triage?',
    content:
      'We are evaluating priority classification + routing. Looking for what worked and what failed in production.',
    replies: 14,
    likes: 39,
    avatar: 'https://i.pravatar.cc/150?img=62',
    replyAvatars: ['https://i.pravatar.cc/150?img=27', 'https://i.pravatar.cc/150?img=28'],
  },
  {
    id: 6,
    community: 'c/buildinpublic',
    author: 'Maya Lee',
    time: '34m',
    space: 'New Info Space',
    title: 'Our first paid cohort crossed 100 users today',
    content: 'Big milestone for us. Next focus is retention week-2 and feature adoption.',
    replies: 31,
    likes: 146,
    avatar: 'https://i.pravatar.cc/150?img=63',
    image: 'https://picsum.photos/id/1005/900/650',
    replyAvatars: ['https://i.pravatar.cc/150?img=29', 'https://i.pravatar.cc/150?img=30'],
  },
];

const PostItem = ({ item, index, isLast, palette, styles }) => {
  const [imageFailed, setImageFailed] = React.useState(false);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 350, delay: index * 80 }}
    >
      <View style={styles.postRow}>
        <View style={styles.leftRail}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          {!isLast && <View style={styles.verticalLine} />}
        </View>

        <View style={styles.postMain}>
          <Text style={styles.metaLine}>
            {item.community} · {item.author} · {item.time}
          </Text>
          <Text style={styles.spaceText}>{item.space}</Text>

          <Text style={styles.postTitle}>{item.title}</Text>
          {!!item.content && <Text style={styles.postContent}>{item.content}</Text>}

          {item.preview && (
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <Image source={{ uri: item.preview.avatar }} style={styles.previewAvatar} />
                <Text style={styles.previewHeaderText}>{item.preview.header}</Text>
              </View>
              <Text style={styles.previewBody}>{item.preview.text}</Text>
              <Text style={styles.previewMeta}>{item.preview.meta}</Text>
            </View>
          )}

          {item.image && !imageFailed && (
            <Image
              source={{ uri: item.image }}
              style={styles.postImage}
              resizeMode="cover"
              onError={() => setImageFailed(true)}
            />
          )}

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
              <Ionicons name="heart-outline" size={25} color={palette.icon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
              <Ionicons name="chatbubble-outline" size={23} color={palette.icon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
              <Ionicons name="repeat-outline" size={23} color={palette.icon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
              <Ionicons name="paper-plane-outline" size={23} color={palette.icon} />
            </TouchableOpacity>
          </View>

          <View style={styles.replyRow}>
            <View style={styles.replyAvatars}>
              <Image source={{ uri: item.replyAvatars[0] }} style={styles.replyAvatarFront} />
              <Image source={{ uri: item.replyAvatars[1] }} style={styles.replyAvatarBack} />
            </View>
            <Text style={styles.replyText}>{item.replies} replies</Text>
          </View>
        </View>
      </View>
    </MotiView>
  );
};

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const { palette, isDark, toggleTheme } = useAppTheme();
  const styles = React.useMemo(() => createStyles(palette), [palette]);
  
  // Refresh animation states
  const refreshRotateValue = useRef(new Animated.Value(0)).current;
  const [isRefreshing, setIsRefreshing] = useState(false);

  // onResume - Trigger refresh animation when coming back to foreground
  useFocusEffect(
    React.useCallback(() => {
      // Start refresh animation
      setIsRefreshing(true);
      
      // Animate rotation
      Animated.sequence([
        Animated.timing(refreshRotateValue, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => {
        refreshRotateValue.setValue(0);
        setIsRefreshing(false);
      });
    }, [refreshRotateValue])
  );

  const rotateInterpolation = refreshRotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity activeOpacity={0.8} onPress={toggleTheme}>
          <Ionicons
            name={isDark ? 'moon-outline' : 'sunny-outline'}
            size={24}
            color={palette.icon}
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Ionicons name="logo-instagram" size={18} color={palette.icon} />
          <View style={styles.centerPills}>
            <View style={styles.pill} />
            <View style={styles.pill} />
          </View>
          <Ionicons name="infinite-outline" size={21} color={palette.icon} />
          <View style={styles.dot} />
        </View>

        <View style={{ position: 'relative' }}>
          {isRefreshing && (
            <Animated.View
              style={{
                transform: [{ rotate: rotateInterpolation }],
              }}
            >
              <Ionicons name="sync-outline" size={24} color={palette.active} />
            </Animated.View>
          )}
          {!isRefreshing && (
            <TouchableOpacity activeOpacity={0.8}>
              <Ionicons name="search-outline" size={25} color={palette.icon} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isRefreshing && (
        <View style={[styles.refreshIndicator, { backgroundColor: palette.surface }]}>
          <Text style={[styles.refreshText, { color: palette.active }]}>
            ✓ Feed refreshed
          </Text>
        </View>
      )}

      <FlatList
        data={posts}
        renderItem={({ item, index }) => (
          <PostItem
            item={item}
            index={index}
            isLast={index === posts.length - 1}
            palette={palette}
            styles={styles}
          />
        )}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContent}
      />
    </View>
  );
};

const createStyles = (palette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    header: {
      paddingHorizontal: 12,
      paddingBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerCenter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    centerPills: {
      flexDirection: 'row',
      gap: 6,
    },
    pill: {
      width: 18,
      height: 12,
      borderRadius: 8,
      backgroundColor: palette.headerPill,
    },
    dot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: palette.headerPill,
    },
    refreshIndicator: {
      marginHorizontal: 12,
      marginBottom: 10,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    refreshText: {
      fontSize: 13,
      fontWeight: '600',
    },
    feedContent: {
      paddingHorizontal: 12,
      paddingBottom: 180,
    },
    postRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 26,
    },
    leftRail: {
      width: 46,
      alignItems: 'center',
    },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      marginTop: 6,
    },
    verticalLine: {
      width: 1.2,
      flex: 1,
      marginTop: 8,
      backgroundColor: palette.line,
    },
    postMain: {
      flex: 1,
      paddingTop: 4,
    },
    metaLine: {
      color: palette.textPrimary,
      fontSize: 14,
      fontWeight: '700',
    },
    spaceText: {
      color: palette.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    postTitle: {
      marginTop: 8,
      color: palette.textPrimary,
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '700',
    },
    postContent: {
      marginTop: 6,
      color: palette.textSecondary,
      fontSize: 16,
      lineHeight: 24,
    },
    previewCard: {
      marginTop: 12,
      padding: 10,
      borderRadius: 14,
      backgroundColor: palette.card,
      borderWidth: 1,
      borderColor: palette.border,
    },
    previewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    previewAvatar: {
      width: 25,
      height: 25,
      borderRadius: 12.5,
      marginRight: 8,
    },
    previewHeaderText: {
      color: palette.textSecondary,
      fontSize: 14,
    },
    previewBody: {
      color: palette.textPrimary,
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600',
    },
    previewMeta: {
      marginTop: 6,
      color: palette.textSecondary,
      fontSize: 13,
    },
    postImage: {
      width: '100%',
      height: 220,
      borderRadius: 24,
      marginTop: 12,
      backgroundColor: palette.surface,
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      gap: 18,
    },
    actionBtn: {
      paddingVertical: 2,
    },
    replyRow: {
      marginTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },
    replyAvatars: {
      width: 44,
      height: 22,
      marginRight: 8,
    },
    replyAvatarFront: {
      width: 22,
      height: 22,
      borderRadius: 11,
      position: 'absolute',
      left: 0,
      borderWidth: 1,
      borderColor: palette.background,
    },
    replyAvatarBack: {
      width: 22,
      height: 22,
      borderRadius: 11,
      position: 'absolute',
      left: 14,
      borderWidth: 1,
      borderColor: palette.background,
    },
    replyText: {
      color: palette.textPrimary,
      fontSize: 15,
      fontWeight: '500',
    },
  });

export default HomeScreen;
