package com.cacaosd.cagdasc.data.provider

import com.cacaosd.cagdasc.data.model.LinksData
import com.cacaosd.cagdasc.data.model.PersonalDetailData

object PersonalHeaderProvider {

    operator fun invoke() = PersonalDetailData(
        name = "Cagdas Caglak",
        position = "Senior Android Developer",
        linksData = listOf(
            LinksData(name = "fa-github", title = "Github link", url = "https://github.com/cagdasc"),
            LinksData(
                name = "fa-stack-overflow",
                title = "Stackoverflow link",
                url = "https://stackoverflow.com/users/2925157"
            ),
            LinksData(name = "fa-linkedin", title = "LinkedIn link", url = "https://www.linkedin.com/in/cagdascaglak"),
        )
    )
}
