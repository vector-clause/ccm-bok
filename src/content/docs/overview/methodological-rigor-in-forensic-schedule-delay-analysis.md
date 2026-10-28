---
title: Methodological Rigor in Forensic Schedule Delay Analysis
description: Methodological Rigor in Forensic Schedule Delay Analysis
id: ccm-overview-methodological-rigor-in-forensic-schedule-delay-analysis
type: comparison
status: draft
sidebar:
  order: 3
sources:
  - 10
  - 11
sources_unverified:
  - 12
  - 65
license: CC-BY-NC-SA-4.0
---

:::note[Draft provenance]
Synthesised text carried over from the source outline; citation numbers link to [References](/references/) and have not been verified.
:::

The resolution of construction delay claims depends heavily on the technical integrity of schedule delay analysis<sup>[10](/references/#ref-10)</sup>. Schedule disputes frequently devolve into protracted conflicts due to the retrospective manipulation of logic links, subjective float allocation, and conflicting interpretations of concurrent delay<sup>[11](/references/#ref-11)</sup>. Both the SCL Delay and Disruption Protocol (2nd Edition) and AACE International Recommended Practice 29R-03 categorize schedule delay methods according to three structural criteria: whether they are prospective or retrospective, additive or subtractive, and observational or modeled<sup>[10](/references/#ref-10)</sup>.  
The selection of a forensic delay methodology should be determined by the standard form of contract, the timing of the dispute, and the availability of verified contemporaneous project records<sup>[11](/references/#ref-11)</sup>. When an assessment occurs contemporaneously during construction, prospective methods like Time Impact Analysis (TIA) are appropriate because they reflect the critical path and project float at the time the delay event arose, enabling the parties to implement mitigation strategies in real time<sup>[12](/references/#ref-12)</sup>.  
Conversely, when disputes are addressed post-completion in arbitration or litigation, arbitral tribunals frequently reject prospective models in favor of retrospective observational methods, such as Time-Slice Window Analysis<sup>[10](/references/#ref-10)</sup>. Because prospective methods analyze theoretical models, they can overstate delay by failing to account for subsequent contractor re-sequencing, acceleration, or pacing<sup>[11](/references/#ref-11)</sup>. Retrospective methods examine what actually transpired along the critical path as the project unfolded, providing courts with verifiable evidence of causation and float consumption<sup>[10](/references/#ref-10)</sup>.

| Methodology | Timing and Approach (AACE 29R-03 / SCL) | Primary Baseline Data Requirements | Core Analytical Mechanics | Key Strategic Strengths | Notable Vulnerabilities and Counter-Arguments |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Impacted As-Planned (IAP)** | Prospective; Additive; Modeled<sup>[11](/references/#ref-11)</sup>. | Initial accepted baseline schedule only<sup>[11](/references/#ref-11)</sup>. | Delay events are inserted into the static baseline schedule to project a theoretical completion date<sup>[11](/references/#ref-11)</sup>. | Simple execution; low preparation cost; does not require updated or as-built records<sup>[11](/references/#ref-11)</sup>. | Fails to account for actual progress, shifting critical paths, or concurrent contractor pacing<sup>[11](/references/#ref-11)</sup>. |
| **Time Impact Analysis (TIA)** | Prospective; Additive; Modeled<sup>[12](/references/#ref-12)</sup>. | Contemporaneous accepted baseline and monthly update files<sup>[11](/references/#ref-11)</sup>. | Delay events are modeled as fragnet networks and inserted into the update file preceding the event<sup>[12](/references/#ref-12)</sup>. | Contractually required by NEC and FIDIC; reflects contemporaneous critical path status<sup>[12](/references/#ref-12)</sup>. | Sensitive to baseline logic flaws; can overestimate delay if prospective impacts are mitigated later<sup>[65](/references/#ref-65)</sup>. |
| **Time-Slice / Windows Analysis** | Retrospective; Observational / Modeled<sup>[10](/references/#ref-10)</sup>. | Baseline schedule and complete set of monthly schedule updates<sup>[10](/references/#ref-10)</sup>. | Breaks the project duration into monthly "windows" to track the dynamic evolution of the critical path<sup>[10](/references/#ref-10)</sup>. | High credibility in formal dispute forums; evaluates actual performance and critical path migration<sup>[10](/references/#ref-10)</sup>. | Resource-intensive; highly dependent on the quality and factual accuracy of intermediate updates<sup>[10](/references/#ref-10)</sup>. |
| **As-Planned vs. As-Built Comparison** | Retrospective; Observational<sup>[10](/references/#ref-10)</sup>. | Initial baseline schedule and fully verified as-built schedule<sup>[10](/references/#ref-10)</sup>. | Directly contrasts planned milestone dates against actual completion dates to identify variances<sup>[10](/references/#ref-10)</sup>. | Clear, accessible presentation for tribunals; does not rely on complex software recalculations. | Does not isolate the cause of delay; incapable of analyzing float depletion or complex parallel paths<sup>[11](/references/#ref-11)</sup>. |
| **Collapsed As-Built (But-For)** | Retrospective; Subtractive; Modeled<sup>[10](/references/#ref-10)</sup>. | Fully detailed, logic-linked as-built schedule model<sup>[11](/references/#ref-11)</sup>. | Removes specific delay events from the as-built model to determine when work would have finished "but-for" those events<sup>[10](/references/#ref-10)</sup>. | Demonstrates specific causation by isolating discrete owner-caused or contractor-caused delays<sup>[10](/references/#ref-10)</sup>. | Subject to retrospective bias when inserting subjective logic links into historical as-built activities<sup>[11](/references/#ref-11)</sup>. |
