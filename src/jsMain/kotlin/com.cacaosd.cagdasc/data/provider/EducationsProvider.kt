package com.cacaosd.cagdasc.data.provider

import com.cacaosd.cagdasc.data.model.Educations
import com.cacaosd.cagdasc.data.model.Section

object EducationsProvider {

    operator fun invoke() = Section.Education(
        educations = listOf(
            Educations(
                school = "Yildiz Technical University",
                department = "Computer Engineering",
                date = "2010 - 2015"
            )
        )
    )
}
