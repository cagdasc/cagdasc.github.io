package com.cacaosd.cagdasc.view

import androidx.compose.runtime.Composable
import com.cacaosd.cagdasc.data.model.LinksData
import com.cacaosd.cagdasc.data.model.PersonalDetailData
import org.jetbrains.compose.web.attributes.ATarget
import org.jetbrains.compose.web.attributes.href
import org.jetbrains.compose.web.attributes.target
import org.jetbrains.compose.web.dom.*

@Composable
fun PersonalHeaderWeb(personalDetailData: PersonalDetailData) {
    Div(attrs = { classes("row") }) {
        Div(attrs = { classes("col-xs-12", "col-sm-6", "col-md-6", "col-lg-8", "header-left") }) {
            H1 {
                Text(personalDetailData.name)
            }

            H2 {
                Text(personalDetailData.position)
            }
        }

        LinksWeb(personalDetailData.linksData)
    }

}

@Composable
fun LinksWeb(linksData: List<LinksData>) {
    Div(attrs = { classes("col-xs-12", "col-sm-6", "col-md-6", "col-lg-4", "header-right") }) {
        Ul(attrs = {
            classes("icons", "no-print")
        }) {
            linksData.forEach { linksData ->
                Li {
                    A(attrs = {
                        classes("button", "button--sacnite", "button--round-l")
                        target(ATarget.Blank)
                        href(linksData.url)
                    }) {
                        I(
                            attrs = {
                                classes("fab", linksData.name)
                                title(linksData.title)
                            })
                    }
                }
            }
        }
        P {
            Text("Email:")
            A(attrs = {
                target(ATarget.Blank)
                href("mailto:cagdascaglak [at] gmail.com")
            }) {
                Text("cagdascaglak [at] gmail.com")
            }
        }
    }
}