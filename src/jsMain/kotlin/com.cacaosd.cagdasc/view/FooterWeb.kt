package com.cacaosd.cagdasc.view

import androidx.compose.runtime.Composable
import com.cacaosd.cagdasc.data.model.FooterData
import org.jetbrains.compose.web.attributes.ATarget
import org.jetbrains.compose.web.attributes.href
import org.jetbrains.compose.web.attributes.target
import org.jetbrains.compose.web.dom.A
import org.jetbrains.compose.web.dom.P
import org.jetbrains.compose.web.dom.Text

@Composable
fun FooterWeb(footerData: FooterData) {
    P {
        Text("${footerData.name} - ")
        A(attrs = {
            href("mailto:${footerData.email}")
            target(ATarget.Blank)
        }) {
            Text(footerData.email)
        }
        Text(" - ${footerData.message}")
    }
}
