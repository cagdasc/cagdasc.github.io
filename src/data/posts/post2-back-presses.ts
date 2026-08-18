import { BlogPost } from '../../types';

export const post2BackPresses: BlogPost = {
  id: '2',
  slug: 'handling-back-presses-in-jetpack-compose-and-onbackinvokedcallback',
  title: 'Handling Back Presses in Jetpack Compose and OnBackInvokedCallback',
  summary: 'Mastering predictive back gestures in Android 13/14+ using Jetpack Compose BackHandler, custom gesture thresholds, and Clean Architecture state hoisting.',
  publishedAt: 'August 14, 2025',
  readTime: '5 min read',
  category: 'Architecture',
  tags: ['Jetpack Compose', 'Predictive Back', 'Navigation', 'Android 14', 'UX'],
  featured: false,
  content: `With the arrival of Predictive Back animations in modern Android (API 33+ and 34+), the platform fundamentally changed how back navigation is intercepted.

The old \`Activity.onBackPressed()\` method is deprecated in favor of \`OnBackInvokedCallback\`. In Jetpack Compose, the \`BackHandler\` and \`PredictiveBackHandler\` APIs allow us to handle back gestures gracefully while keeping navigation logic cleanly decoupled.

---

## The Evolution of Back Handling

Historically, intercepting back presses required overriding \`onBackPressed()\` in your \`MainActivity\` or fragment. This had serious drawbacks:
- It broke system animation previews before the user committed to the back gesture.
- It created tight coupling between UI components and activity lifecycles.
- Managing nested multi-step modal dialogs or bottom sheets was error-prone.

---

## Using Compose BackHandler

In Jetpack Compose, \`androidx.activity.compose.BackHandler\` registers an interceptor that automatically unregisters when the composable leaves the composition.

\`\`\`kotlin
@Composable
fun FilterBottomSheet(
    hasUnsavedChanges: Boolean,
    onDismiss: () -> Unit,
    onShowDiscardConfirmation: () -> Unit
) {
    // Only intercept when unsaved changes exist
    BackHandler(enabled = hasUnsavedChanges) {
        onShowDiscardConfirmation()
    }

    BottomSheetContent(onClose = onDismiss)
}
\`\`\`

---

## Supporting Predictive Back Gestures in Android 14+

Android 14 introduced \`PredictiveBackHandler\`, which delivers a stream of \`BackEventCompat\` objects as the user drags their finger from the edge of the screen:

\`\`\`kotlin
@Composable
fun StatefulCustomModal(
    isOpen: Boolean,
    onClose: () -> Unit
) {
    var progress by remember { mutableFloatStateOf(0f) }

    if (isOpen) {
        PredictiveBackHandler { progressFlow ->
            try {
                progressFlow.collect { backEvent ->
                    // Scale modal down as user drags finger back
                    progress = backEvent.progress
                }
                // Gesture completed!
                onClose()
            } catch (e: CancellationException) {
                // User cancelled gesture by dragging finger back to edge
                progress = 0f
            }
        }

        ModalSurface(
            modifier = Modifier.graphicsLayer {
                scaleX = 1f - (progress * 0.15f)
                scaleY = 1f - (progress * 0.15f)
                alpha = 1f - (progress * 0.3f)
            }
        )
    }
}
\`\`\`

---

## Best Practices Checklist

1. **Hoisting State**: Never manage business state inside \`BackHandler\` callbacks. Always invoke a callback lambda passed down from the ViewModel or parent container.
2. **Granular enabled Flags**: Always pass a boolean condition to \`enabled\` so the system predictive back preview can function when no custom interception is needed.
3. **Cleanup**: Compose handles lifecycle registration automatically, ensuring zero memory leaks or dangling listeners when switching tabs.`
};
