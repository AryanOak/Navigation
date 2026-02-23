import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../context/ThemeContext';
import { useAppLifecycle } from '../context/AppLifecycleContext';

const CommentScreen = () => {
  const insets = useSafeAreaInsets();
  const { palette } = useAppTheme();
  const { commentDraft, setCommentDraft } = useAppLifecycle();
  
  // Local state for submission
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Handle message change - update context
  const handleMessageChange = (text) => {
    setCommentDraft(text);
  };

  // Submit message
  const handleSubmit = async () => {
    if (!commentDraft.trim()) {
      return;
    }

    try {
      // Submit message (in real app, send to server)
      setIsSubmitted(true);
      
      // Clear draft after submission
      setCommentDraft('');
      
      // Reset form after 1.5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 1500);
    } catch (error) {
      console.error('Error submitting message:', error);
    }
  };

  // Clear draft manually
  const handleClearDraft = () => {
    setCommentDraft('');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: palette.background }]}
    >
      <View style={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 10 }]}>
        {/* Header */}
        <Text style={[styles.title, { color: palette.textPrimary }]}>
          Comment Screen
        </Text>
        <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
          onPause Demo: Draft in App State
        </Text>

        {/* Info Cards */}
        <View style={[styles.infoCard, { backgroundColor: palette.surface }]}>
          <Ionicons name="information-circle-outline" size={20} color={palette.active} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.infoTitle, { color: palette.textPrimary }]}>
              How Draft Works
            </Text>
            <Text style={[styles.infoText, { color: palette.textSecondary }]}>
              • Type message & navigate away → draft is saved in memory
            </Text>
            <Text style={[styles.infoText, { color: palette.textSecondary }]}>
              • Come back to Comments → draft still here ✓
            </Text>
            <Text style={[styles.infoText, { color: palette.textSecondary }]}>
              • Close app completely → draft is cleared ✓
            </Text>
          </View>
        </View>

        {/* Message Display (if submitted) */}
        {isSubmitted && (
          <View style={[styles.successCard, { backgroundColor: palette.active + '20', borderColor: palette.active }]}>
            <Ionicons name="checkmark-circle" size={24} color={palette.active} />
            <Text style={[styles.successText, { color: palette.active }]}>
              Message posted successfully!
            </Text>
          </View>
        )}

        {/* Draft Status */}
        {commentDraft && !isSubmitted && (
          <View style={[styles.draftStatusCard, { backgroundColor: palette.surface, borderColor: palette.active }]}>
            <View style={styles.draftStatusLeft}>
              <Ionicons name="save-outline" size={18} color={palette.active} />
              <Text style={[styles.draftStatusText, { color: palette.active }]}>
                Draft saved in memory
              </Text>
            </View>
          </View>
        )}

        {/* Text Input Area */}
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: palette.textPrimary }]}>
            Write a Comment
          </Text>
          <TextInput
            placeholder="Type your message here..."
            placeholderTextColor={palette.textMuted}
            value={commentDraft}
            onChangeText={handleMessageChange}
            multiline
            style={[
              styles.textInput,
              {
                backgroundColor: palette.surface,
                color: palette.textPrimary,
                borderColor: commentDraft ? palette.active : palette.border,
              },
            ]}
            editable={!isSubmitted}
            maxLength={500}
          />
          
          <View style={styles.charCountRow}>
            <Text style={[styles.charCount, { color: palette.textMuted }]}>
              {commentDraft.length}/500
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: palette.active, opacity: commentDraft.trim() ? 1 : 0.5 }]}
            onPress={handleSubmit}
            disabled={!commentDraft.trim() || isSubmitted}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={18} color="#050608" />
            <Text style={styles.submitBtnText}>Post Comment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.clearBtn, { backgroundColor: palette.surface, borderColor: palette.border }]}
            onPress={handleClearDraft}
            disabled={isSubmitted}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={16} color={palette.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  infoCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
  successCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
  },
  successText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
  draftStatusCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 2,
  },
  draftStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  draftStatusText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    fontFamily: 'System',
  },
  charCountRow: {
    alignItems: 'flex-end',
    marginTop: 6,
  },
  charCount: {
    fontSize: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  submitBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#050608',
    fontSize: 14,
    fontWeight: '700',
  },
  clearBtn: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CommentScreen;
