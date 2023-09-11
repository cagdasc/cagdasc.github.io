package com.cacaosd.cagdasc.data.provider

import com.cacaosd.cagdasc.data.model.Section

object AboutProvider {

    operator fun invoke() = Section.About(
        about = "I am a self‑motivated and solution focused developer who is interested in state‑of‑the‑art technologies and who has a passion for problem‑solving. Additionally, free open source software development has a special place in my heart. I am currently working for Nutmeg which is the largest digital wealth manager in the UK with 200k clients. My work description is building mobile application for Android. When I am not working in my main field, I take an interest in contributing open‑source projects, which occupies my free time."
    )
}
