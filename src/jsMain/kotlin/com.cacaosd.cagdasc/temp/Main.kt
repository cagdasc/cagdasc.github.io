package com.cacaosd.cagdasc.temp

import androidx.compose.runtime.Composable
import org.jetbrains.compose.web.attributes.ATarget
import org.jetbrains.compose.web.attributes.href
import org.jetbrains.compose.web.attributes.target
import org.jetbrains.compose.web.css.*
import org.jetbrains.compose.web.dom.*
import org.jetbrains.compose.web.renderComposable

fun main2() {
    renderComposable(rootElementId = "root") {
        Div(attrs = {
            classes("container", "header-container")
            style {
                paddingRight(15.px)
                paddingLeft(15.px)
                marginTop(50.px)
                property("margin-right", "auto")
                property("margin-left", "auto")
                width(1170.px)

                fontFamily("Roboto", "sans-serif")
                property("font-feature-settings", "kern, liga, pnum")
                lineHeight("1.5")
                fontSize(1.cssRem)
            }
        }) {
            PersonalHeader()
            ContactsSection()
        }

        Main()
    }
}

@Composable
fun ContactsSection() {
    Div(attrs = {
        classes("col-xs-12", "col-sm-6", "col-md-6", "col-lg-4", "header-right")
    }) {
        Ul(attrs = {
            classes("icons", "no-print")
        }) {
            Li {
                A(attrs = {
                    classes("button", "button--sacnite", "button--round-l")
                    target(ATarget.Blank)
                    href("https://github.com/cagdasc")
                }) {
                    I(attrs = {
                        classes("fa", "fa-github")
                    })
                }
            }
        }
    }
}
