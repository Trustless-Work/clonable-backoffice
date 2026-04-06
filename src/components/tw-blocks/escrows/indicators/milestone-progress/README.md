# Escrow Milestone Progress Indicator

A reusable, production-ready component for visualizing milestone progress in escrow contracts. Supports both horizontal progress bars and circular progress indicators.

## Overview

This component calculates and displays the progress of milestone completion based on their state (released or approved). It includes built-in validation to ensure business rules are respected, with safe error handling for invalid configurations.

## Features

- **Dynamic Progress Calculation**: Automatically calculates progress based on milestone states
- **Two Visualization Styles**: Horizontal bar and circular donut indicators
- **Business Rule Validation**: Enforces mode restrictions based on escrow type
- **Type Safety**: Full TypeScript support with strict typing
- **Error Handling**: Safe fallback rendering for invalid configurations
- **Responsive Design**: Works across all screen sizes
- **Accessibility**: Semantic HTML with ARIA labels
- **Dark Mode Support**: Optimized colors for both light and dark themes

## Installation

This component is already integrated in the repository. No additional installation required.

<!-- Usage examples removed — per repository policy these are not included. -->

## Props

### EscrowMilestoneProgressBar & EscrowMilestoneProgressDonut

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `escrow` | `Escrow` | required | The escrow object containing milestone data |
| `mode` | `'released' \| 'approved'` | required | Progress calculation mode |
| `showText` | `boolean` | `true` | Show text indicator ("X of Y milestones") |
| `showHeader` | `boolean` | `true` | Show header with percentage in the top-right |
| `className` | `string` | `""` | Additional CSS classes for the container |

## Mode Rules

### 'released' Mode

- **Escrow Type**: Multi-release only
- **Metric**: Counts released milestones (where `flags.released === true`)
- **Use Case**: Service providers tracking fund releases
- **Note**: Single-release escrows will show a warning message

### 'approved' Mode

- **Escrow Type**: Both single-release and multi-release
- **Metric**: Counts approved milestones
  - Single-release: where `approved === true`
  - Multi-release: where `flags.approved === true`
- **Use Case**: Clients tracking milestone approvals before release
- **Note**: Works safely with all escrow types

## Return Type (useEscrowMilestoneProgress)

```typescript
interface MilestoneProgressResult {
  totalMilestones: number;        // Total count of milestones
  completedMilestones: number;    // Count matching the mode
  percentage: number;              // 0-100
  isValid: boolean;                // Mode + escrow type valid?
  errorMessage: string;            // Error details if invalid
}
```

## Edge Cases

All edge cases are handled safely without runtime errors:

| Scenario | Behavior |
|----------|----------|
| **Zero milestones** | Shows 0% progress bar with "No milestones" text |
| **Single-release + 'released' mode** | Shows warning message |
| **Single-release + 'approved' mode** | Works normally (not an error) |
| **Multi-release + 'released' mode** | Works normally |
| **Multi-release + 'approved' mode** | Works normally |
| **Missing escrow** | Shows validation error |
| **No approved/released milestones** | Shows 0% progress |
| **All milestones completed** | Shows 100% progress |

## Calculation Logic

The progress percentage is calculated as:

```
Progress % = (completed_milestones / total_milestones) × 100
```

Where `completed_milestones` is:

- **For 'released' mode**: Count of milestones where `flags.released === true`
- **For 'approved' mode**: Count of milestones where `approved === true` (single) or `flags.approved === true` (multi)

## Styling

The components use Tailwind CSS and inherit colors from your design system:

- **Progress Color**: Dynamic based on percentage
  - 0%: Muted (light gray)
  - 1-33%: Destructive (red)
  - 34-66%: Warning (yellow)
  - 67-100%: Primary (blue)

All colors automatically adapt to light/dark mode.

<!-- Example snippets removed — see component docs in code for usage. -->

## Testing

### Manual Testing Checklist

- [ ] Multi-release escrow with no released milestones → 0%
- [ ] Multi-release escrow with partial releases → correct percentage
- [ ] Multi-release escrow with all released → 100%
- [ ] Single-release escrow with 'released' mode → warning message
- [ ] Single-release escrow with 'approved' mode → works correctly
- [ ] Escrow with no milestones → "No milestones" message
- [ ] Bar and donut both render correctly
- [ ] showText toggle works properly
- [ ] Dark mode colors are readable
- [ ] Mobile responsive layout

## API Reference

### Types

```typescript
type EscrowMilestoneProgressMode = 'released' | 'approved';

interface EscrowMilestoneProgressProps {
  escrow: Escrow | null | undefined;
  mode: EscrowMilestoneProgressMode;
  className?: string;
  showText?: boolean;
  showHeader?: boolean;
}

interface MilestoneProgressResult {
  totalMilestones: number;
  completedMilestones: number;
  percentage: number;
  isValid: boolean;
  errorMessage: string;
}
```

### Exports

```typescript
// Components
export { EscrowMilestoneProgressBar } from './bar';
export { EscrowMilestoneProgressDonut } from './donut';

// Hook
export { useEscrowMilestoneProgress } from './useEscrowMilestoneProgress';

// Utility
export { calculateMilestoneProgress } from './useEscrowMilestoneProgress';

// Types
export type {
  EscrowMilestoneProgressMode,
  EscrowMilestoneProgressProps,
  MilestoneProgressResult,
} from './types';
```

## Performance

- No external dependencies beyond existing project dependencies
- Lightweight calculations (simple arithmetic operations)
- Memoization-friendly hook design
- No unnecessary re-renders

## Accessibility

- Semantic HTML structure
- Proper ARIA labels on progress elements
- Color contrast meets WCAG AA standards
- Works with keyboard navigation
- Screen reader friendly text labels

## Browser Support

Supports all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 15+
- iOS Safari 15+

## Contributing

When modifying this component:

1. Maintain backward compatibility with props
2. Update types if changing interfaces
3. Test all edge cases
4. Update documentation
5. Ensure ESLint passes: `npm run lint`

## Related Components

- [BalanceProgressBar](../balance-progress/bar/BalanceProgress.tsx) - Financial progress indicator
- [BalanceProgressDonut](../balance-progress/donut/BalanceProgress.tsx) - Financial circular indicator
- [MilestoneCard](../../escrows-by-role/details/MilestoneCard.tsx) - Detailed milestone display

## Documentation References

- [Trustless Work Docs](https://docs.trustlesswork.com/)
- [Progress Indicator Block Reference](https://blocks.trustlesswork.com/blocks/indicators-balance-progress)
- [Escrow Types Documentation](https://docs.trustlesswork.com/trustless-work/technology-overview/escrow-types)

---

**Last Updated**: February 24, 2026
