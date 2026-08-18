import { BlogPost } from '../../types';

export const post1ScreenshotTesting: BlogPost = {
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
};
