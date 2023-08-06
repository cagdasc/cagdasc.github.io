package com.cacaosd.cagdasc.temp

import androidx.compose.runtime.Composable
import org.jetbrains.compose.web.css.*
import org.jetbrains.compose.web.dom.Div
import org.jetbrains.compose.web.dom.H1
import org.jetbrains.compose.web.dom.H2
import org.jetbrains.compose.web.dom.Text

@Composable
fun PersonalHeader() {
    Div(attrs = {
        style {
            position(Position.Relative)
            minHeight(1.px)
            paddingRight(15.px)
            paddingLeft(15.px)
            property("float", "left")
            width(66.6667.percent)
            marginTop(30.px)
        }
    }) {
        H1(attrs = {
            style {
                property("color", "inherit")
                margin(0.px, 0.px, 0.px, 0.75.cssRem)
                lineHeight("1.2")
                fontSize(2.5.cssRem)
                marginBottom(0.1.cssRem)
                fontWeight(500)

            }
        }) {
            Text("Cagdas Caglak")
        }

        H2(attrs = {
            style {
                property("color", "inherit")
                margin(0.px, 0.px, 0.px, 0.75.cssRem)
                lineHeight("1.2")
                fontSize(1.5.cssRem)
                marginBottom(0.1.cssRem)
                fontWeight(300)
            }
        }) {
            Text("Senior Android Developer")
        }
    }
}