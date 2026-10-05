---
name: Deep Learning Atlas
description: An editorial learning atlas connecting algorithm mechanisms with scientific practice.
colors:
  ink: "#14284b"
  muted: "#60708b"
  line: "#d6dfe9"
  blue: "#245fbd"
  blue-dark: "#184998"
  blue-pale: "#ecf3ff"
  paper: "#fff"
typography:
  display:
    fontFamily: '"Songti SC", "Noto Serif CJK SC", "Source Han Serif SC", Georgia, serif'
    fontSize: "clamp(42px, 3.55vw, 54px)"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.015em"
  lesson-title:
    fontFamily: '"Songti SC", "Noto Serif CJK SC", "Source Han Serif SC", Georgia, serif'
    fontSize: "clamp(34px, 3.3vw, 52px)"
    lineHeight: 1.2
    letterSpacing: "0.02em"
  section-title:
    fontFamily: '"Songti SC", "Noto Serif CJK SC", "Source Han Serif SC", Georgia, serif'
    fontSize: "24px"
  lesson-body:
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: "15px"
    lineHeight: 1.95
  english-subtitle:
    fontFamily: 'Georgia, "Songti SC", "Noto Serif CJK SC", "Source Han Serif SC", serif'
    fontWeight: 400
  control:
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: "13px"
    lineHeight: 1.5
rounded:
  button: "3px"
  field: "4px"
  practice-control: "5px"
  table: "6px"
  diagram: "12px"
  filter: "22px"
spacing:
  compact: "8px"
  control: "12px"
  panel: "24px"
  gutter: "clamp(22px, 3.5vw, 64px)"
components:
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.paper}"
    rounded: "{rounded.button}"
    padding: "0 26px"
    height: "58px"
  button-primary-hover:
    backgroundColor: "{colors.blue-dark}"
    textColor: "{colors.paper}"
  practice-button:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.practice-control}"
    padding: "10px 15px"
  practice-button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.control}"
    rounded: "{rounded.practice-control}"
    padding: "10px 15px"
  filter-selected:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.paper}"
    rounded: "{rounded.filter}"
    padding: "7px 11px"
---

# Design System: Deep Learning Atlas

## Overview

Deep Learning Atlas uses a white and navy editorial reading surface. Chinese serif headings give lessons their hierarchy; English method names and subtitles remain visible alongside the Chinese explanation. Sans serif body copy and controls support dense technical reading. The research workbench extends this established identity.

Thin rules, numbered rows, aligned columns and restrained blue states organize the material. Scientific diagrams carry the visual explanation: they expose inputs, intermediate quantities, parameter effects and outputs. Controls sit near the quantity or step they change, with interpretation and limits adjacent to the result.

**Key Characteristics:**

- White reading surfaces, navy text and a consistent blue action color.
- Serif titles paired with sans serif prose, form labels and numerical readouts.
- Wide mechanism diagrams and compact controls within an editorial layout.
- Manual navigation for course outlines and research stages; controlled playback for mechanism visualizations.
- Synthetic examples and conclusion boundaries stated beside the relevant calculation.

This record is grounded in `src/styles.css`, `src/practice.css`, `src/research.css`, `src/animation.css`, and their lesson, practice, workbench and explainer components. Token values describe the implemented source; this document makes no screenshot or rendered inspection claims.

## Colors

### Primary

- **Blue** identifies links, the main landing action, active navigation, selected filters, parameter readouts and scientific emphasis. **Blue Dark** is the primary action's hover color and is also used by research course links.
- **Blue Pale** gives selected or hovered controls a quiet background without interrupting the white reading surface.

### Neutral

- **Ink** is the navy text color and the solid selected state for practice controls and the current research stage.
- **Muted** supports secondary descriptions and annotations. Several component styles use related local blue gray values; preserve those contextual differences when extending a component.
- **Line** separates lesson rows, reading columns, stages, tables and input/output contracts.
- **Paper** is the site background and the default control surface.

Scientific diagrams also use local blue, teal, orange and other categorical colors. Their mapping belongs to the specific mechanism and its legend. Donor split figures use filled blue circles for train and hollow circles for test, accompanied by text labels and a count.

**The State and Evidence Rule.** Pair scientific color with a label, shape, position or value. Selected controls are also expressed through `aria-pressed` or `aria-current`; a donor split is described in accessible text as well as circle fills.

## Typography

The display and heading stack is the existing Chinese serif stack recorded above. The main sans serif stack begins with Inter and retains platform and Chinese fallbacks. English subtitles frequently use Georgia; formulas also use Georgia or a serif fallback. These are the implemented families, with platform availability determining the rendered face.

The hierarchy changes with the reading surface:

- **Display:** the landing headline uses the fluid display token. On screens at or below (760px), it uses `clamp(40px, 9vw, 54px)`.
- **Lesson title:** a large serif heading uses the lesson title token; its English line is smaller, regular weight and set beneath it. On small screens the title becomes (36px).
- **Section title:** lesson section headings use the section title token with a bottom rule. The research entry uses a compact page title (`clamp(30px, 3vw, 40px)`), followed by the selected research question as its initial workbench h2 (`clamp(23px, 2.5vw, 31px)`). Workbench stages use (27px), reducing to (23px) on narrow screens.
- **Body:** lesson paragraphs use the lesson body token. Practice and research prose use generous line height (1.9); short diagram explanations typically use (13px) at (1.65).
- **Controls and data:** compact controls use the control token. Tables use (13px); parameter values and research stage counts use tabular numerals so changes do not shift alignment.

Reading widths are explicit in the workbench: questions and stage prose are limited to (76ch), and the input/output boundary caption to (95ch). Keep explanation text within these measures while allowing diagrams to occupy more width.

## Layout

The page gutter is fluid on desktop and becomes (20px) at or below (760px). Reading and navigation use grids with `minmax(0, 1fr)` so the flexible column can shrink. The default body minimum width is (320px).

Lesson pages have chapter navigation on the left, a flexible reading column in the center and supplementary notes on the right. At or below (1100px), the right notes disappear and the left column becomes (205px). At or below (760px), both side columns give way to a single reading column. The lesson main column keeps its section rhythm and inline diagrams.

The practice page is centered at a maximum width of (1260px), with a header limited to (820px). Its main tabs wrap. The research entry reduces top padding to (30px) and tightens the header and tab spacing, bringing the project choice and question toward the start of the page. Research questions, contract, mechanism, stages and evaluation sections share this practice surface. The input/output contract uses three columns in the proportions `1fr 0.8fr 1fr`, with a caption spanning them. At or below (800px), Input and Output remain side by side in two equal columns, with the transformation and caption below. Mechanisms and the donor example are limited to (900px).

Research stages form six columns on wide screens and three columns at or below (800px). At or below (540px), project choices use two columns with the first choice spanning both; stage labels stack within their buttons, donor labels move above their measurements, and the two column protocol form becomes one column.

**The Diagram Legibility Rule.** Preserve the diagram's internal label scale through a local horizontal scroll region. Parameter canvases have a minimum width of (720px) within an accessible, keyboard focusable region; their SVG coordinate system is (720 × 360). Research mechanisms also expose readable numerical results outside the SVG, and their accessible diagram names include the current computed state. Tables use the same local scrolling pattern, with a default minimum width of (520px) and a research comparison width of (790px). The surrounding page and prose continue to fit the viewport.

## Elevation & Depth

Most reading surfaces are flat. Borders, ruled columns, pale fills and active state contrast provide structure. The explainer stage uses a subtle radial wash from white toward pale blue; it is contained within the mechanism panel.

Shadows have specific roles: the main landing action lifts on hover (`0 8px 20px #245fbd22`), the mobile navigation casts a light overlay shadow (`0 15px 25px #14284b10`), and animation library cards gain a faint hover shadow (`0 5px 22px #234d8c0a`). Search focus uses a pale blue ring (`0 0 0 3px #dce9ff`). Workbench content sections rely on rules and spacing.

## Shapes

Editorial sections, lesson rows and the research contract use straight edges and fine rules. Compact controls have small corners: the landing action uses the button radius, practice controls use the practice control radius, protocol text areas use the field radius, and scrolling table frames use the table radius. The atlas category filter is a pill using the filter radius.

Diagrams have their own softer geometry: the shared parameter canvas uses the diagram radius, diagram nodes use (9px), and donor measurements are circles (16px diameter) with a (2px) blue outline. Keep those shapes tied to scientific content and state.

## Components

### Navigation and lesson rows

The desktop header places the serif brand and compact navigation on one horizontal line. Active navigation uses blue text and a bottom rule. At or below (880px), navigation opens from a menu button as a full width white list under the header.

Atlas lessons are ruled rows with a blue serif number, bilingual title, summary, metadata and arrow. Hover adds a faint pale background. At or below (760px), the row becomes number, title and arrow; summaries and metadata are hidden, and the progress control remains available. Chapter navigation uses a pale selected fill and blue left rule.

### Buttons, tabs and fields

The landing action is solid blue with white text. Practice actions and tabs are smaller outlined controls; their primary or selected state is solid navy. Research project choices are underlined tabs: the selected choice is blue, and hover adds Blue Pale. The current research stage is navy with white text; adjacent stages retain a pale background.

Practice buttons lower opacity to (0.45) when disabled. Workbench buttons, links, inputs, text areas and disclosure summaries have a visible blue focus outline (3px) with an offset (3px). Explainer controls use their existing pale blue focus outline and bordered hover state. Preserve native labels, `aria-pressed`, `aria-current`, meaningful disabled states and keyboard access when extending these controls.

The atlas search field has a fine border, small rounded corners and a blue border with pale ring on focus. Protocol text areas use a white surface, a blue gray border, vertical resizing, visible labels and a blue caret. Draft status appears beside the editing actions. Native range inputs show their label, current numerical output and a parameter hint; range changes update the visible experiment immediately.

### Reading containers and disclosures

Content sections use top or bottom rules and readable spacing. The selected research question leads the workbench; its background and method gap sit in an expandable native disclosure. The input/output contract displays the transformation between explicit Input and Output labels, with its synthetic example notice and boundary caption below. Algorithm comparisons and editable protocols also use native disclosure summaries. Comparison tables keep headings and cell content aligned, with explanatory text and linked method names inside the relevant cell.

### Scientific explainers

The mechanism panel contains a serif bilingual title, step counter, optional mode choices, optional parameter control, diagram, step explanation, playback controls, step buttons and utilities. Reset returns the step and parameter to their initial values. A parameter change or manual step selection pauses playback. Course walkthrough mode is manually advanced; research stages are manually selected.

Previous, next, play, pause and reset controls use inline SVG icons with accessible button names. Play, pause and reset also retain visible text labels.

The four research labs can provide a computed result readout below the diagram: count likelihoods, pseudobulk composition, Elastic Net and spatial assignment. These visible label/value pairs use tabular numerals, remain readable without SVG scrolling, and announce changes politely while playback is paused (`aria-live="polite"`; off during playback). Their dynamic SVG names include the corresponding current parameter and calculated values.

**The Calculation Before Motion Rule.** The displayed quantity must come from the underlying teaching calculation. Motion may show flow, changing weights, distributions or coefficients, but its interpretation and limitations remain visible in text. A generic course outline is a sequence of reading steps; it does not imply model training.

Mechanism playback advances at (5200ms) divided by the selected speed. It runs only while the explainer is visible, pauses when the document is hidden, and is disabled under reduced motion. The user can select previous, next or any named step. Short fill, position, dimension and opacity transitions support parameter changes; dashed arrow flow indicates an active computation edge.

Under `prefers-reduced-motion: reduce`, the global stylesheet removes smooth scrolling, transitions and animation. The explainer stops automatic playback and shows a reduced motion message. Manual steps, range inputs, numerical outputs, legends and diagram geometry remain available.

### Practice and research feedback

The donor split example aligns each donor with its row of train/test circles, a shared legend and numerical summary. Revealing predictions adds a donor table, error values and an explanation next to the figure. Changing the split recomputes the displayed result. Increasing cells retains the explicit independent donor count.

Transfer questions use a fieldset, legend and radio labels; a check button exposes feedback through a status message. Research protocols place labeled fields in a two column grid, offer Markdown download and restore actions, and show whether the browser saved the draft. Source links and evidence boundaries sit in the same reading flow as the teaching examples.

## Do's and Don'ts

### Do:

- **Do** extend the white/navy editorial surface, bilingual heading relationship, blue interaction states and ruled reading structure.
- **Do** put the parameter, intermediate value, explanation and result close enough to read as one experiment.
- **Do** preserve manual steps and full numerical meaning when motion is paused or reduced.
- **Do** keep diagrams and tables in labeled local scroll regions when their internal content needs more width.
- **Do** state the synthetic example and conclusion boundary beside the result it qualifies.
- **Do** retain the existing semantics, visible focus states, legends and status feedback when adding controls.

### Don't:

- **Don't** introduce a new visual identity for a research path or turn scientific category colors into new site navigation colors.
- **Don't** shrink a wide mechanism into unreadable labels to fit a phone viewport.
- **Don't** use playback to advance generic outlines or research stages automatically.
- **Don't** present diagram color, animation, toy weights or synthetic error metrics as validated scientific evidence.
- **Don't** copy a decorative label, unused selector or isolated color value into a new global convention.
