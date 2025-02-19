package com.cacaosd.cagdasc.data.provider

import com.cacaosd.cagdasc.data.model.Section

object AboutProvider {

    operator fun invoke() = Section.About(
        about = "I am an experienced Android developer with a strong background in the finance sector. " +
                "Passionate about exploring new technologies, mentoring others, and solving complex problems, " +
                "I thrive on building efficient and scalable solutions. " +
                "Beyond my day-to-day work, I have a special interest in enhancing developer experience by " +
                "creating tools and workflows that improve productivity. In my free time, " +
                "I enjoy developing my own applications and contributing to open-source projects, continuously " +
                "learning and giving back to the community."
    )
}
