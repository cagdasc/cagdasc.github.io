package com.cacaosd.cagdasc.data.provider

import com.cacaosd.cagdasc.data.model.Projects
import com.cacaosd.cagdasc.data.model.Section

object ProjectsProvider {

    operator fun invoke() = Section.Project(
        projects = listOf(
            Projects(
                name = "Later",
                description = "",
                items = listOf(
                    "Kotlin",
                    "MVVM",
                    "Jetpack Compose",
                    "Flow API, Kotlin Coroutine, Hilt, Room",
                    "Firebase Crashlytics, Timber"
                )
            ),
            Projects(
                name = "Zaytungcu",
                description = "", //"One of the most popular satirical news page zaytung.com’s Android application implementation. ",
                items = listOf(
                    "Kotlin",
                    "MVVM",
                    "NavigationUI",
                    "Flow API, Kotlin Coroutine, Hilt, Retrofit",
                    "Firebase Crashlytics, Timber"
                )
            )
        )
    )
}
