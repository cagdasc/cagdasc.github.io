package com.cacaosd.cagdasc.data.provider

import com.cacaosd.cagdasc.data.model.Section
import com.cacaosd.cagdasc.data.model.Skills

object SkillsProvider {

    operator fun invoke() = Section.Skill(
        skills = listOf(
            Skills(
                title = "Programming Languages",
                items = listOf(
                    "Kotlin",
                    "Java",
                    "Python",
                    "Bash Script"
                )
            ),
            Skills(
                title = "Technology",
                items = listOf(
                    "Hilt, Dagger",
                    "Room, Retrofit",
                    "Kotlin Flow, Coroutines, Jetpack Compose",
                    "Jenkins, Bitrise",
                    "MockK, Mockito, JUnit, Espresso"
                )
            ),
            Skills(
                title = "Social",
                items = listOf(
                    "Excellent communication skills, both verbal and written",
                    "Strong organizational and communication skills",
                    "Community of Practice organizer"
                )
            )
        )
    )
}
