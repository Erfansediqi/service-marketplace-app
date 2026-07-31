import { useRef } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import {
    Colors,
    Radius,
    Spacing,
    Typography,
} from "../../constants/theme";
import { GlassSurface } from "./glass-surface";

type GlassOtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: string;
  autoFocus?: boolean;
};

export function GlassOtpInput({
  value,
  onChange,
  length = 4,
  error,
  autoFocus = false,
}: GlassOtpInputProps) {
  const inputRef = useRef<TextInput>(null);

  const safeValue = value.replace(/\D/g, "").slice(0, length);

  return (
    <View style={styles.wrapper}>
      <Pressable
        accessibilityLabel={`Verification code, ${length} digits`}
        onPress={() => inputRef.current?.focus()}
        style={styles.cells}
      >
        {Array.from({ length }).map((_, index) => {
          const character = safeValue[index];
          const active =
            index === safeValue.length ||
            (safeValue.length === length && index === length - 1);

          return (
            <GlassSurface
              key={index}
              radius={Radius.lg}
              variant={active ? "prominent" : "regular"}
              style={[
                styles.cell,
                active && styles.activeCell,
                error && styles.errorCell,
              ]}
              contentStyle={styles.cellContent}
            >
              <Text style={styles.character}>{character ?? ""}</Text>
            </GlassSurface>
          );
        })}

        <TextInput
          ref={inputRef}
          autoFocus={autoFocus}
          caretHidden
          contextMenuHidden={false}
          keyboardType="number-pad"
          maxLength={length}
          onChangeText={(text) =>
            onChange(text.replace(/\D/g, "").slice(0, length))
          }
          selectionColor="transparent"
          style={styles.hiddenInput}
          textContentType="oneTimeCode"
          value={safeValue}
        />
      </Pressable>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    gap: Spacing.md,
  },
  cells: {
    position: "relative",
    width: "100%",
    flexDirection: "row",
    gap: Spacing.md,
  },
  cell: {
    flex: 1,
    aspectRatio: 0.92,
    maxHeight: 68,
  },
  cellContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  activeCell: {
    borderColor: "rgba(76, 141, 255, 0.70)",
    backgroundColor: "rgba(76, 141, 255, 0.08)",
  },
  errorCell: {
    borderColor: "rgba(225, 90, 90, 0.72)",
  },
  character: {
    color: Colors.textPrimary,
    fontSize: 25,
    lineHeight: 30,
    fontWeight: "600",
  },
  hiddenInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.01,
  },
  errorText: {
    ...Typography.captionStyle,
    color: Colors.error,
    textAlign: "center",
  },
});