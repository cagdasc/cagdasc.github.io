package com.cacaosd.cagdasc.data.provider

import com.cacaosd.cagdasc.data.model.Experiences
import com.cacaosd.cagdasc.data.model.Section

object ExperienceProvider {

    operator fun invoke() = Section.Experience(
        experiences = listOf(
            Experiences(
                company = "Nutmeg",
                position = "Senior Android Developer",
                date = "March 2023 - Present",
                quote = "Nutmeg is the UK’s largest truly digital wealth manager, offering clarity and transparency to both seasoned and first-time investors as they seek to achieve their financial goals.",
                items = listOf(
                    "Taking key roles at scaling \"Nutmeg\" application to thousands of users on Android platforms",
                    "Developing ”Nutmeg” Android applications, maintaining and integrating new technologies.",
                    "Taking advantage of functional programming by using Kotlin programming languages.",
                    "Implemented Clean Architecture using Dagger, Flow and RxJava.",
                    "Determined architectural and product design details for open-ended tasks or specifications.",
                    "Collaborated with quality engineers, user research, product management, design, and support teams to ensure quality in all phases of app development.",
                )
            ),
            Experiences(
                company = "Meditopia",
                position = "Senior Android Developer",
                date = "November 2021 - November 2022",
                quote = "The world's most popular mental wellness platform for non-English speakers.",
                items = listOf(
                    "Taking key roles at scaling \"Meditopia\" application to millions of users on Android platforms",
                    "Developing \"Meditopia\" Android applications, maintaining and integrating new technologies.",
                    "Taking advantage of declarative UI development with Jetpack Compose.",
                    "Taking advantage of functional programming by using Kotlin programming languages.",
                    "Implemented Clean Architecture using Hilt and Kotlin Flow.",
                    "Working on Android Media infrastructure and implemented media content using ExoPlayer.",
                    "Determined architectural and product design details for open-ended tasks or specifications.",
                    "Collaborated with quality engineers, user research, product management, design, and support teams to ensure quality in all phases of app development.",
                    "Comprehensive experience in the design and implementation of Continuous Integration, Continuous Deployment Continuous Delivery and DevOps Operations.",
                )
            ),
            Experiences(
                company = "Garanti BBVA Technology",
                position = "Senior Android Developer",
                date = "January 2016 - November 2021",
                quote = "Garanti BBVA Technology is one of the biggest banking infrastructure companies in Turkey. ",
                items = listOf(
                    "Developing \"Garanti BBVA Mobile\" Android application, maintaining and integrating new technologies.",
                    "Fulfilling key roles at scaling \"Garanti BBVA Mobile\" application to millions of users on Android platforms.",
                    "Developing an AI based customer assistants to increase the accessibility of application features.",
                    "Taking advantage of functional programming by using Kotlin programming languages.",
                    "Building a code generation tool and save 30% of development time.",
                    "Increasing code coverage with move application architecture from MVC to MVVM.",
                    "Comprehensive experience in the design and implementation of Continuous Integration, Continuous Deployment, Continuous Delivery and DevOps Operations.",
                    "Participated within an Agile/Scrum team as a Scrum Master, extensive hands on experience with quality assurance methods.",
                )
            )
        )
    )
}
