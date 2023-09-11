package com.cacaosd.cagdasc.data.provider

import com.cacaosd.cagdasc.data.model.FooterData

object FooterProvider {

    operator fun invoke() = FooterData(
        name = "Cagdas Caglak",
        email = " cagdascaglak [at] gmail.com",
        message = "References on request"
    )
}
