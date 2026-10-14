import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BrandColors } from '../constants/theme';

interface FormattedReportTextProps {
  reportText: string;
  isDarkMode?: boolean;
  textColor?: string;
}

export const FormattedReportText: React.FC<FormattedReportTextProps> = ({
  reportText,
  isDarkMode = false,
  textColor,
}) => {
  const defaultText = textColor || (isDarkMode ? BrandColors.dark.text : BrandColors.light.text);
  const headingColor = isDarkMode ? '#38BDF8' : BrandColors.primary;
  const boldColor = isDarkMode ? '#FFFFFF' : '#0F172A';

  if (!reportText || !reportText.trim()) {
    return (
      <Text style={[styles.paragraph, { color: defaultText }]}>
        No report content available.
      </Text>
    );
  }

  // Parse inline formatting: **bold**, *italic*, and strip rogue markers
  const renderInlineStyled = (text: string, baseStyle?: any) => {
    // Split on **bold** boundaries
    const parts = text.split(/(\*\*.*?\*\*)/g);

    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        const inner = part.slice(2, -2);
        return (
          <Text key={idx} style={[{ fontWeight: '700', color: boldColor }, baseStyle]}>
            {inner}
          </Text>
        );
      }

      // Check for *italic* within regular text
      if (part.includes('*')) {
        const italicParts = part.split(/(\*.*?\*)/g);
        return italicParts.map((sub, sIdx) => {
          if (sub.startsWith('*') && sub.endsWith('*') && sub.length >= 2) {
            return (
              <Text key={`${idx}-${sIdx}`} style={[{ fontStyle: 'italic', color: defaultText }, baseStyle]}>
                {sub.slice(1, -1)}
              </Text>
            );
          }
          // Strip any stray asterisks that weren't matched
          const cleaned = sub.replace(/\*+/g, '');
          return (
            <Text key={`${idx}-${sIdx}`} style={[{ color: defaultText }, baseStyle]}>
              {cleaned}
            </Text>
          );
        });
      }

      // Clean leftover markdown asterisks
      const cleanedPart = part.replace(/\*+/g, '');
      return (
        <Text key={idx} style={[{ color: defaultText }, baseStyle]}>
          {cleanedPart}
        </Text>
      );
    });
  };

  const lines = reportText.split('\n');

  return (
    <View style={styles.container}>
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <View key={lineIdx} style={styles.lineSpacer} />;
        }

        // Headings: ### H3, ## H2, # H1
        if (trimmed.startsWith('#')) {
          const headingLevel = trimmed.match(/^#+/)?.[0].length || 1;
          const headingText = trimmed.replace(/^#+\s*/, '').replace(/\*+/g, '');
          return (
            <View
              key={lineIdx}
              style={[
                styles.headingWrap,
                headingLevel === 1 && styles.h1Wrap,
                headingLevel === 2 && styles.h2Wrap,
                headingLevel >= 3 && styles.h3Wrap,
              ]}
            >
              <Text
                style={[
                  styles.headingText,
                  headingLevel === 1 && styles.h1Text,
                  headingLevel === 2 && styles.h2Text,
                  headingLevel >= 3 && styles.h3Text,
                  { color: headingColor },
                ]}
              >
                {renderInlineStyled(headingText)}
              </Text>
            </View>
          );
        }

        // Section divider: --- or ___
        if (/^[-_]{3,}$/.test(trimmed)) {
          return (
            <View
              key={lineIdx}
              style={[
                styles.divider,
                { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
              ]}
            />
          );
        }

        // Bullet point: - , * , • , + 
        if (/^[-*•+]\s+/.test(trimmed)) {
          const bulletText = trimmed.replace(/^[-*•+]\s+/, '');
          return (
            <View key={lineIdx} style={styles.bulletRow}>
              <View
                style={[
                  styles.bulletDot,
                  { backgroundColor: isDarkMode ? '#38BDF8' : BrandColors.primary },
                ]}
              />
              <Text style={[styles.bulletContent, { color: defaultText }]}>
                {renderInlineStyled(bulletText)}
              </Text>
            </View>
          );
        }

        // Numbered list: 1. , 2. 
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          const num = numMatch[1];
          const rest = numMatch[2];
          return (
            <View key={lineIdx} style={styles.bulletRow}>
              <Text
                style={[
                  styles.numBadge,
                  { color: isDarkMode ? '#38BDF8' : BrandColors.primary },
                ]}
              >
                {num}.
              </Text>
              <Text style={[styles.bulletContent, { color: defaultText }]}>
                {renderInlineStyled(rest)}
              </Text>
            </View>
          );
        }

        // Regular paragraph text
        return (
          <Text key={lineIdx} style={[styles.paragraph, { color: defaultText }]}>
            {renderInlineStyled(trimmed)}
          </Text>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  lineSpacer: {
    height: 8,
  },
  headingWrap: {
    marginTop: 10,
    marginBottom: 4,
  },
  h1Wrap: {
    marginTop: 14,
    marginBottom: 6,
  },
  h2Wrap: {
    marginTop: 12,
    marginBottom: 5,
  },
  h3Wrap: {
    marginTop: 8,
    marginBottom: 3,
  },
  headingText: {
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  h1Text: {
    fontSize: 18,
    lineHeight: 24,
  },
  h2Text: {
    fontSize: 16,
    lineHeight: 22,
  },
  h3Text: {
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 4,
    marginVertical: 2,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: 10,
  },
  numBadge: {
    fontWeight: '700',
    fontSize: 13,
    marginRight: 8,
    minWidth: 18,
  },
  bulletContent: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginVertical: 2,
  },
});
