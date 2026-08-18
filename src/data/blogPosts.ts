import { BlogPost } from '../types';

export const blogPostsData: BlogPost[] = [
    /*
  {
    id: '1',
    slug: 'android-screenshot-testing-on-autopilot',
    title: 'Android Screenshot Testing on Autopilot: Automating UI Verification with Compose Previews, KSP & Paparazzi',
    summary: 'How we eliminated manual test authoring by building a pipeline that transforms standard Jetpack Compose @Preview annotations into headless screenshot tests executed in seconds on CI.',
    publishedAt: 'October 18, 2025',
    readTime: '7 min read',
    category: 'Testing & Tooling',
    tags: ['Jetpack Compose', 'KSP', 'Paparazzi', 'CI/CD', 'Developer Experience'],
    featured: true,
    content: `Screenshot testing has revolutionized visual regression verification on Android. However, in most engineering teams, developers still write redundant test classes that do nothing more than instantiate a Composable inside a Paparazzi rule.

When you have hundreds of components across multi-module projects, this manual boilerplate becomes tedious to maintain and prone to neglect.

In this article, I will walk through how we put **Screenshot Testing on Autopilot** by leveraging **Kotlin Symbol Processing (KSP)** to scan \`@Preview\` annotations and automatically generate headless Paparazzi tests at compile time.

---

## The Problem: Redundant Boilerplate

Consider a standard design system button component:

\`\`\`kotlin
@Composable
fun PrimaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true
) {
    Button(
        onClick = onClick,
        modifier = modifier,
        enabled = enabled,
        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
    ) {
        Text(text = text, style = MaterialTheme.typography.labelLarge)
    }
}

@Preview(name = "Primary Button - Default")
@Preview(name = "Primary Button - Disabled")
@Composable
private fun PrimaryButtonPreview() {
    AppTheme {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            PrimaryButton(text = "Submit Order", onClick = {})
            PrimaryButton(text = "Processing...", onClick = {}, enabled = false)
        }
    }
}
\`\`\`

To test this with Paparazzi manually, a developer previously had to write:

\`\`\`kotlin
class PrimaryButtonScreenshotTest {
    @get:Rule
    val paparazzi = Paparazzi(deviceConfig = DeviceConfig.PIXEL_5)

    @Test
    fun primaryButton_default() {
        paparazzi.snapshot {
            PrimaryButtonPreview()
        }
    }
}
\`\`\`

Multiplying this by 150+ design components and screen states across 20+ feature modules results in thousands of lines of boilerplate code that developers frequently forget to write or update.

---

## The Architecture: Connecting Previews to Paparazzi via KSP

Instead of asking developers to author test files, why not let the compiler generate them?

1. **Scan**: A custom **KSP Processor** inspects all Kotlin files during compilation and collects functions annotated with \`@Preview\` or custom multi-preview annotations (e.g. \`@DevicePreviews\`, \`@ThemePreviews\`).
2. **Code Generation**: The processor uses **KotlinPoet** to generate a single synthetic JUnit4 test class for each package or module.
3. **Execution**: Paparazzi executes these generated tests in a headless JVM environment without starting heavy Android emulators.

---

## Implementing the KSP Symbol Processor

Here is how the core \`SymbolProcessor\` searches for target composables:

\`\`\`kotlin
class ScreenshotTestSymbolProcessor(
    private val codeGenerator: CodeGenerator,
    private val logger: KSPLogger
) : SymbolProcessor {

    override fun process(resolver: Resolver): List<KSAnnotated> {
        val previewSymbols = resolver
            .getSymbolsWithAnnotation("androidx.compose.ui.tooling.preview.Preview")
            .filterIsInstance<KSFunctionDeclaration>()

        if (!previewSymbols.iterator().hasNext()) return emptyList()

        generatePaparazziTestFiles(previewSymbols.toList())
        return emptyList()
    }

    private fun generatePaparazziTestFiles(symbols: List<KSFunctionDeclaration>) {
        val fileSpecBuilder = FileSpec.builder("com.myapp.generated.screenshots", "AutopilotScreenshotTests")
        val classBuilder = TypeSpec.classBuilder("AutopilotScreenshotTests")
            .addAnnotation(
                AnnotationSpec.builder(RunWith::class)
                    .addMember("%T::class", ClassName("org.junit.runners", "Parameterized"))
                    .build()
            )

        // Generate paparazzi rule and parameterized snapshot tests
    }
}
\`\`\`

---

## CI/CD Pipeline Benefits

When integrated into our GitHub Actions workflows:

- **100% UI Coverage by Default**: Every new Composable preview written by any developer is automatically validated on the next pull request without writing test classes.
- **Fast Execution**: Because Paparazzi renders on the host JVM using LayoutLib, hundreds of component snapshots run in under 45 seconds on standard Linux CI runners.
- **Visual Diffs on PRs**: Changed snapshots generate inline PR comment visual diffs for designers and product managers to review before merging.

\`\`\`bash
# Run all autopilot screenshot tests locally or on CI
./gradlew recordPaparazziDebug
./gradlew verifyPaparazziDebug
\`\`\`

---

## Conclusion

Automating screenshot testing by coupling \`@Preview\` metadata with KSP code generation transforms visual verification from a chore into a seamless background guarantee.

Developers write components and previews as they normally do, and the autopilot pipeline handles test authoring, golden snapshot generation, and CI verification automatically.`
  },
  {
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
  },
  {
    id: '3',
    slug: 'architecting-kotlin-multiplatform-ui-and-platform-foundations',
    title: 'Architecting Kotlin Multiplatform (KMP): Practical UI & Platform Foundations for Production',
    summary: 'Architectural blueprints for modular KMP libraries: structuring commonMain, sharing platform abstractions (secure storage, logging, dispatchers), and Compose Multiplatform design tokens.',
    publishedAt: 'June 22, 2025',
    readTime: '8 min read',
    category: 'Kotlin Multiplatform',
    tags: ['KMP', 'Compose Multiplatform', 'Architecture', 'Kotlin', 'Cross-Platform'],
    featured: true,
    content: `Kotlin Multiplatform (KMP) has reached full production maturity. Rather than a monolithic "all-or-nothing" cross-platform rewrite, the winning strategy adopted by modern engineering organizations is modular foundation libraries.

In this article, I share the architecture patterns behind our open-source \`kmp-platform-foundation\` and \`kmp-ui-foundation\` repositories.

---

## The Foundation Triad: Platform, Domain, UI

When structuring a scalable KMP workspace, separation of concerns is vital:
- **Platform Foundation**: Secure vault storage, logging contracts, thread dispatchers, HTTP client wrappers.
- **Domain Logic**: Business rules, state machines, algorithmic validation.
- **UI Foundation**: Atomic design tokens, theme color palettes, typography systems.

---

## Designing Clean expect / actual Platform Contracts

Platform-specific APIs (e.g. Keychain on iOS vs EncryptedSharedPreferences on Android) should never leak into domain or UI layers. We define clean interfaces in \`commonMain\`:

\`\`\`kotlin
// commonMain/src/commonMain/kotlin/foundation/storage/SecureVault.kt
interface SecureVault {
    suspend fun store(key: String, value: String)
    suspend fun retrieve(key: String): String?
    suspend fun clear(key: String)
}

expect class SecureVaultFactory {
    fun create(): SecureVault
}
\`\`\`

On Android (\`androidMain\`):

\`\`\`kotlin
actual class SecureVaultFactory(private val context: Context) {
    actual fun create(): SecureVault = AndroidEncryptedVault(context)
}
\`\`\`

On iOS (\`iosMain\`):

\`\`\`kotlin
actual class SecureVaultFactory {
    actual fun create(): SecureVault = AppleKeychainVault()
}
\`\`\`

---

## Sharing UI Design Tokens with Compose Multiplatform

With Compose Multiplatform, you can share not just business logic but also atomic design system tokens (colors, typography, spacing scales):

\`\`\`kotlin
@Immutable
data class FoundationColorPalette(
    val brandPrimary: Color,
    val backgroundSurface: Color,
    val textPrimary: Color,
    val statusSuccess: Color,
    val statusDanger: Color
)

val LocalColorPalette = staticCompositionLocalOf<FoundationColorPalette> {
    error("No ColorPalette provided")
}

@Composable
fun FoundationTheme(
    isDarkMode: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val palette = if (isDarkMode) DarkPalette else LightPalette

    CompositionLocalProvider(
        LocalColorPalette provides palette
    ) {
        content()
    }
}
\`\`\`

---

## Key Takeaways

- Start with core foundations (networking, persistence, analytics interfaces) before sharing UI.
- Use explicit interfaces in \`commonMain\` with factory injection rather than scattering \`expect\`/\`actual\` everywhere.
- Test \`commonMain\` code thoroughly on the JVM with mock implementations for rapid feedback loops.`
  },
  {
    id: '4',
    slug: 'supercharging-mobile-ci-cd-fastlane-github-actions-gradle-cache',
    title: 'Supercharging Mobile CI/CD: Fastlane, GitHub Actions, and Remote Gradle Build Cache',
    summary: 'Step-by-step optimization techniques that slashed our Android CI pull request build times from 24 minutes to under 4 minutes using distributed cache and smart test sharding.',
    publishedAt: 'March 30, 2025',
    readTime: '6 min read',
    category: 'CI/CD & DevOps',
    tags: ['GitHub Actions', 'Gradle Build Cache', 'Fastlane', 'DevOps', 'Build Speed'],
    featured: false,
    content: `Slow CI pipelines destroy developer productivity and context switching. In large Android multi-module projects, waiting 20 to 30 minutes for a lint check and unit test run slows down the entire delivery cycle.

Here is how we optimized our Android CI workflow to run under 4 minutes on GitHub Actions.

---

## 1. Remote Gradle Build Cache

Local Gradle caching only benefits the machine running the build. By enabling a secure remote HTTP build cache, every CI runner can reuse task outputs (compilation, dexing, linting, KSP generation) produced by previous runs or local builds.

\`\`\`kotlin
// settings.gradle.kts
buildCache {
    local {
        isEnabled = true
    }
    remote<HttpBuildCache> {
        url = uri("https://gradle-cache.internal.domain/cache/")
        isPush = System.getenv("CI") != null
        credentials {
            username = System.getenv("GRADLE_CACHE_USER")
            password = System.getenv("GRADLE_CACHE_PASSWORD")
        }
    }
}
\`\`\`

---

## 2. GitHub Actions Dependency Caching

Ensure that Gradle wrapper and cache directories are preserved across runner instances with granular action caches.

---

## 3. Parallel Sharding of Screenshot and Unit Tests

Instead of running all 400+ unit and screenshot tests sequentially on a single runner, shard tasks across parallel virtual machines in GitHub Actions.

---

## Results and Metrics

- **Full PR Verification Time**: Reduced from 24 min 15 sec to 3 min 45 sec.
- **Gradle Cache Hit Rate**: Increased from ~18% to ~89%.
- **CI Cost Savings**: 65% reduction in billable runner minutes.
- **Developer Satisfaction**: Improved from 3.2 to 4.8 / 5.0.`
  },
  {
    id: '5',
    slug: 'unidirectional-data-flow-and-state-in-fintech-apps',
    title: 'Unidirectional Data Flow & State Management in High-Scale Fintech Apps',
    summary: 'Handling complex financial balances, portfolio charts, biometric locks, and idempotent mutations safely using Kotlin Flow, immutable state modeling, and Channels.',
    publishedAt: 'January 12, 2025',
    readTime: '6 min read',
    category: 'Architecture',
    tags: ['Clean Architecture', 'Kotlin Flow', 'MVI', 'Fintech', 'State Management'],
    featured: false,
    content: `In financial applications, UI state inconsistencies (such as showing an outdated cash balance after a bank deposit or executing duplicate fund transfers on poor network connectivity) are critical defects.

Unidirectional Data Flow (UDF) guarantees that state flows down in one direction from immutable models, while user intents flow up as explicit actions.

---

## The Contract: State, Intent, and Single-Shot Effect

\`\`\`kotlin
// State representation
@Immutable
data class PortfolioUiState(
    val isLoading: Boolean = false,
    val totalBalanceFormatted: String = "£0.00",
    val allocationBreakdown: List<AssetAllocation> = emptyList(),
    val isBiometricLockEngaged: Boolean = false,
    val errorMessage: String? = null
)

// Intent representing user or system action
sealed interface PortfolioIntent {
    data object RefreshData : PortfolioIntent
    data class RebalancePortfolio(val targetStrategyId: String) : PortfolioIntent
    data object ToggleBiometricLock : PortfolioIntent
}

// Side-effects that should only execute once (Navigation, Snackbars)
sealed interface PortfolioEffect {
    data class ShowToast(val message: String) : PortfolioEffect
    data class NavigateToDepositFlow(val accountId: String) : PortfolioEffect
}
\`\`\`

---

## ViewModel Implementation with StateFlow & Channel

\`\`\`kotlin
@HiltViewModel
class PortfolioViewModel @Inject constructor(
    private val getPortfolioUseCase: GetPortfolioUseCase,
    private val rebalanceUseCase: RebalanceUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow(PortfolioUiState(isLoading = true))
    val uiState: StateFlow<PortfolioUiState> = _uiState.asStateFlow()

    private val _effects = Channel<PortfolioEffect>(Channel.BUFFERED)
    val effects = _effects.receiveAsFlow()

    fun processIntent(intent: PortfolioIntent) {
        when (intent) {
            is PortfolioIntent.RefreshData -> loadPortfolio()
            is PortfolioIntent.RebalancePortfolio -> executeRebalance(intent.targetStrategyId)
            is PortfolioIntent.ToggleBiometricLock -> toggleLock()
        }
    }

    private fun loadPortfolio() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            getPortfolioUseCase()
                .onSuccess { data ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            totalBalanceFormatted = data.totalFormatted,
                            allocationBreakdown = data.allocations,
                            errorMessage = null
                        )
                    }
                }
                .onFailure { error ->
                    _uiState.update { it.copy(isLoading = false, errorMessage = error.localizedMessage) }
                }
        }
    }
}
\`\`\`

---

## UI Binding in Jetpack Compose

\`\`\`kotlin
@Composable
fun PortfolioScreen(
    viewModel: PortfolioViewModel = hiltViewModel(),
    onNavigateDeposit: (String) -> Unit
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(Unit) {
        viewModel.effects.collect { effect ->
            when (effect) {
                is PortfolioEffect.ShowToast -> snackbarHostState.showSnackbar(effect.message)
                is PortfolioEffect.NavigateToDepositFlow -> onNavigateDeposit(effect.accountId)
            }
        }
    }

    PortfolioContent(
        state = state,
        onIntent = viewModel::processIntent
    )
}
\`\`\`

---

## Summary

Combining immutable UI states with unidirectional intent handlers eliminates race conditions and ensures that your mobile UI reflects the exact source of truth at all times.`
  }
  */
];
