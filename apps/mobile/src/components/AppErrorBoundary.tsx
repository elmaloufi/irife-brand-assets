import { Component, type ReactNode } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  private retry = (): void => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.iconShell}>
              <Text style={styles.icon}>!</Text>
            </View>
            <Text style={styles.eyebrow}>IRIFE</Text>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.description}>
              The screen could not be displayed. Your saved account and device data have not been cleared.
            </Text>
            <Pressable accessibilityRole="button" onPress={this.retry} style={styles.button}>
              <Text style={styles.buttonText}>Try again</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, justifyContent: 'center', backgroundColor: theme.colors.background },
  content: { alignItems: 'center', gap: 14, padding: 28 },
  iconShell: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: theme.colors.dangerSoft },
  icon: { color: theme.colors.danger, fontSize: 28, fontWeight: '900' },
  eyebrow: { color: theme.colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  title: { color: theme.colors.ink, fontSize: 22, fontWeight: '900', textAlign: 'center' },
  description: { color: theme.colors.secondary, fontSize: 12, lineHeight: 19, textAlign: 'center' },
  button: { minHeight: 46, minWidth: 150, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, borderRadius: 15, backgroundColor: theme.colors.primaryDark },
  buttonText: { color: theme.colors.white, fontSize: 12, fontWeight: '900' },
});
