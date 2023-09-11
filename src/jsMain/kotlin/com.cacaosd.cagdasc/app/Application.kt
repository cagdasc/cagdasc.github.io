package com.cacaosd.cagdasc.app

import com.cacaosd.cagdasc.data.provider.*
import com.cacaosd.cagdasc.view.FooterWeb
import com.cacaosd.cagdasc.view.IntroContainerWeb
import com.cacaosd.cagdasc.view.ListContainerWeb
import com.cacaosd.cagdasc.view.PersonalHeaderWeb
import org.jetbrains.compose.web.dom.Div
import org.jetbrains.compose.web.dom.Main
import org.jetbrains.compose.web.renderComposable

fun main() {
    renderComposable(rootElementId = "root") {
        Div(attrs = { classes("container", "header-container") }) {
            PersonalHeaderWeb(PersonalHeaderProvider())
        }

        Main(attrs = {
            classes("page-content")
            this.attr("aria-label", "Content")
        }) {
            Div(attrs = { classes("wrapper") }) {
                IntroContainerWeb(AboutProvider())
                ListContainerWeb(ExperienceProvider())
                ListContainerWeb(ProjectsProvider())
                ListContainerWeb(EducationsProvider())
                ListContainerWeb(SkillsProvider())
            }
        }
        Div(attrs = { classes("container", "footer-container") }) {
            FooterWeb(FooterProvider())
        }
    }
}