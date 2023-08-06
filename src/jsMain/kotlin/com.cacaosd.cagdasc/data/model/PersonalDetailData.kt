package com.cacaosd.cagdasc.data.model

data class PersonalDetailData(
    val name: String,
    val position: String,
    val linksData: List<LinksData>
)

data class LinksData(val name: String, val title: String, val url: String)
