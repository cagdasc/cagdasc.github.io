package com.cacaosd.cagdasc.view

import androidx.compose.runtime.Composable
import com.cacaosd.cagdasc.data.model.*
import org.jetbrains.compose.web.dom.*

@Composable
fun ListContainerWeb(section: Section) {
    Div(attrs = { classes("container", "list-container") }) {
        H3 { Text(section.title) }

        when (section) {
            is Section.Experience -> {
                section.experiences.forEach { experiences ->
                    ExperiencesContent(experiences = experiences)
                }
            }

            is Section.Project -> section.projects.forEach { projects ->
                ProjectsContent(projects = projects)
            }

            is Section.Education -> section.educations.forEach { educations ->
                EducationContent(educations = educations)
            }

            is Section.Skill -> section.skills.forEach { skills ->
                SkillsContent(skills = skills)
            }

            else -> {
                // ignore About
            }
        }
    }
}

@Composable
fun ExperiencesContent(experiences: Experiences) {
    Div(attrs = { classes("row", "clearfix", "layout", "layout-right") }) {
        Div(attrs = { classes("col-xs-12", "col-sm-4", "col-md-3", "col-print-12", "details") }) {
            H4 { Text(experiences.company) }
            P { B { Text(experiences.position) } }
            P { Text(experiences.date) }
            P(attrs = { classes("no-print", "aditional-links") })
        }
        Div(attrs = { classes("col-xs-12", "col-sm-8", "col-md-9", "col-print-12", "content") }) {
            P(attrs = { classes("quote") }) { Text(experiences.quote) }
            Ul {
                experiences.items.forEach { item -> Li { Text(item) } }
            }
        }
    }
}

@Composable
fun ProjectsContent(projects: Projects) {
    Div(attrs = { classes("row", "clearfix", "layout", "layout-top") }) {
        Div(attrs = { classes("col-xs-12", "col-sm-4", "col-md-3", "col-print-12", "details") }) {
            H4 { Text(projects.name) }
            P(attrs = { classes("no-print", "aditional-links") })
        }
        Div(attrs = { classes("col-xs-12", "col-sm-8", "col-md-9", "col-print-12", "content") }) {
            if (projects.description.isNotEmpty()) {
                P(attrs = { classes("quote") }) { Text(projects.description) }
            }
            Ul {
                projects.items.forEach { item -> Li { Text(item) } }
            }
        }
    }
}

@Composable
fun EducationContent(educations: Educations) {
    Div(attrs = { classes("row", "clearfix", "layout", "layout-top") }) {
        Div(attrs = { classes("col-xs-12", "col-sm-4", "col-md-3", "col-print-12", "details") }) {
            H4 { Text(educations.school) }
            P { B { Text(educations.department) } }
            P { Text(educations.date) }
            P(attrs = { classes("no-print", "aditional-links") })
        }
        Div(attrs = { classes("col-xs-12", "col-sm-8", "col-md-9", "col-print-12", "content") }) {
        }
    }
}

@Composable
fun SkillsContent(skills: Skills) {
    Div(attrs = { classes("row", "clearfix", "layout", "layout-top") }) {
        Div(attrs = { classes("col-xs-12", "col-sm-4", "col-md-3", "col-print-12", "details") }) {
            H4 { Text(skills.title) }
            P(attrs = { classes("no-print", "aditional-links") })
        }
        Div(attrs = { classes("col-xs-12", "col-sm-8", "col-md-9", "col-print-12", "content") }) {
            Ul {
                skills.items.forEach { item -> Li { Text(item) } }
            }
        }
    }
}
