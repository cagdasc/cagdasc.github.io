package com.cacaosd.cagdasc.data.model

sealed class Section(val title: String) {
    data class About(val about: String) : Section("About Me")

    data class Experience(val experiences: List<Experiences>) : Section("Experience")

    data class Project(val projects: List<Projects>) : Section("Side Projects")

    data class Education(val educations: List<Educations>) : Section("Educations")

    data class Skill(val skills: List<Skills>) : Section("Skills")
}

data class Experiences(
    val company: String,
    val position: String,
    val date: String,
    val quote: String,
    val items: List<String>
)

data class Projects(
    val name: String,
    val description: String,
    val items: List<String>
)

data class Educations(
    val school: String,
    val department: String,
    val date: String,
)

data class Skills(
    val title: String,
    val items: List<String>
)
