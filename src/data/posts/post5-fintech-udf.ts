import { BlogPost } from '../../types';

export const post5FintechUdf: BlogPost = {
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
};
