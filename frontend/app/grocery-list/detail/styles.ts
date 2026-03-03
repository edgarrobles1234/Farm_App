import { StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  saveButton: {
    fontSize: theme.typography.fontSizes.h4,
    fontWeight: '700',
  },
  date: {
    fontSize: theme.typography.fontSizes.h4,
    textAlign: 'center',
    marginVertical: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSizes.h2,
    fontWeight: '700',
    marginBottom: theme.spacing.lg,
  },
  categorySection: {
    marginBottom: theme.spacing.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  categoryTitle: {
    fontSize: theme.typography.fontSizes.h3,
    fontWeight: '600',
    flex: 1,
  },
  categoryHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginLeft: theme.spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: theme.spacing.md,
    marginLeft: 9,
    opacity: 0.4,
  },
  subcatGhostIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  itemText: {
    fontSize: theme.typography.fontSizes.h4,
  },
  itemTextChecked: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  listContent: {
    paddingBottom: theme.spacing.xl * 3,
  },
  toolbarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 15,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  toolbarButton: {
    padding: theme.spacing.xs,
  },
  toolbarButtonActive: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 6,
  },
  toolbarText: {
    fontSize: 23,
    fontWeight: '400',
  },
  toolbarTextBold: {
    fontSize: 23,
    fontWeight: '700',
  },
  toolbarTextUnderline: {
    fontSize: 23,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  toolbarTextItalic: {
    fontSize: 23,
    fontStyle: 'italic',
  },
});
