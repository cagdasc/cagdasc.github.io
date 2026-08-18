import { BlogPost } from '../../types';

export const post3KmpFoundations: BlogPost = {
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
};
