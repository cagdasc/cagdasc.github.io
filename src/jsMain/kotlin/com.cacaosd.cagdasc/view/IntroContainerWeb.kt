package com.cacaosd.cagdasc.view

import androidx.compose.runtime.Composable
import com.cacaosd.cagdasc.data.model.Section
import org.jetbrains.compose.web.dom.*

@Composable
fun IntroContainerWeb(section: Section.About) {
    Div(attrs = { classes("container", "intro-container") }) {
        H3 { Text(section.title) }
        Div(attrs = { classes("row", "clearfix") }) {
            Div(attrs = { classes("col-xs-12", "col-sm-4", "col-md-3", "no-print") }) {
                Span(attrs = {
                    classes("profile-img")
                    style {
                        property("background-image", "url(/images/pp.jpeg)")
                    }
                })
            }
            Div(attrs = { classes("col-xs-12", "col-sm-8", "col-md-9", "col-print-12") }) {
                P { Text(section.about) }
            }
        }
    }
}
