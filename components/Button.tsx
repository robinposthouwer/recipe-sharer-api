import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

type Variant = 'filled' | 'secondary' | 'outline' | 'ghost' | 'destructive';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  icon?: React.ComponentProps<typeof FontAwesome>['name'];
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, { bg: string; text: string; borderColor?: string }> = {
  filled:      { bg: '#2f95dc', text: '#fff' },
  secondary:   { bg: '#1a7f37', text: '#fff' },
  outline:     { bg: 'transparent', text: '#2f95dc', borderColor: '#2f95dc' },
  ghost:       { bg: 'transparent', text: '#2f95dc' },
  destructive: { bg: 'transparent', text: '#c00' },
};

export default function Button({
  title,
  onPress,
  variant = 'filled',
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
}: ButtonProps) {
  const v = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={StyleSheet.flatten([
        styles.base,
        { backgroundColor: v.bg },
        v.borderColor ? { borderWidth: 1.5, borderColor: v.borderColor } : null,
        fullWidth ? { width: '100%' } : null,
        isDisabled ? { opacity: 0.5 } : null,
      ])}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <>
          {icon && <FontAwesome name={icon} size={16} color={v.text} />}
          <Text style={[styles.text, { color: v.text }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
