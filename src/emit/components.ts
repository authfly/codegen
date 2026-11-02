// Templates of the middle-layer component kinds (src/dsl-components.ts), one per target. Names and skin keys come
// from the spec; the markup is the authkit middle layer as reviewed (parity-tested in authkit, 20 states x 9 targets).
import type { Glyph, Heading, Message, Pill } from "../dsl-components";

export const pascal = (w: string) => w.split("-").map((s) => s[0].toUpperCase() + s.slice(1)).join("");
export const camel = (w: string) => w.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

/** Whole files (header added by src/components.ts). */
export function messageJs(c: Message) {
  const P = pascal(c.name), sk = `${camel(c.skin)}Skin`;
  return {
    react: `import type { ReactNode } from "react";
import { Box } from "../ui/box/box";
import { ${sk}, type Tone } from "../skin/skin";
import { LucideIcon } from "./lucide-icon";

export type ${P}Props = { tone?: Tone; icon?: string; role?: "alert" | "status"; id?: string; className?: string; children?: ReactNode; "data-testid"?: string };

/** Inline message (error / info). role="alert" for errors, "status" for info; aria-live polite. */
export function ${P}({ tone = "default", icon, role = tone === "destructive" ? "alert" : "status", className, children, ...rest }: ${P}Props) {
  return (
    <Box role={role} aria-live="polite" data-slot="alert" className={${sk}(tone, className)} {...rest}>
      {icon ? <LucideIcon name={icon} /> : null}
      {children}
    </Box>
  );
}
`,
    solid: `import { Show, type JSX } from "solid-js";
import { Box } from "../ui/box/box.solid";
import { ${sk}, type Tone } from "../skin/skin";
import { LucideIcon } from "./lucide-icon";

export type ${P}Props = { tone?: Tone; icon?: string; role?: "alert" | "status"; id?: string; class?: string; children?: JSX.Element; "data-testid"?: string };

/** Inline message (error / info). role="alert" for errors, "status" for info; aria-live polite. */
export function ${P}(props: ${P}Props) {
  const tone = () => props.tone ?? "default";
  return (
    <Box role={props.role ?? (tone() === "destructive" ? "alert" : "status")} aria-live="polite" data-slot="alert" id={props.id} data-testid={props["data-testid"]} class={${sk}(tone(), props.class)}>
      <Show when={props.icon}>{(i) => <LucideIcon name={i()} />}</Show>
      {props.children}
    </Box>
  );
}
`,
    vue: `<script setup lang="ts">
import Box from "../ui/box/Box.vue";
import { ${sk}, type Tone } from "../skin/skin";
import LucideIcon from "./LucideIcon.vue";
defineOptions({ inheritAttrs: false });
const p = withDefaults(defineProps<{ tone?: Tone; icon?: string; role?: "alert" | "status"; class?: string }>(), { tone: "default" });
</script>
<template>
  <Box :role="p.role ?? (p.tone === 'destructive' ? 'alert' : 'status')" aria-live="polite" data-slot="alert" v-bind="$attrs" :class="${sk}(p.tone, p.class)">
    <LucideIcon v-if="p.icon" :name="p.icon" /><slot />
  </Box>
</template>
`,
    svelte: `<script lang="ts">
  import type { Snippet } from "svelte";
  import Box from "../ui/box/Box.svelte";
  import { ${sk}, type Tone } from "../skin/skin";
  import LucideIcon from "./LucideIcon.svelte";
  let { tone = "default", icon, role, class: className, children, ...rest }: { tone?: Tone; icon?: string; role?: "alert" | "status"; class?: string; children?: Snippet; [k: string]: unknown } = $props();
</script>

<Box role={role ?? (tone === "destructive" ? "alert" : "status")} aria-live="polite" data-slot="alert" {...rest} class={${sk}(tone, className)}>{#if icon}<LucideIcon name={icon} />{/if}{@render children?.()}</Box>
`,
  };
}

/** Whole files (header added by src/components.ts). */
export function pillJs(c: Pill) {
  const P = pascal(c.name), sk = `${camel(c.skin)}Skin`, T = pascal(c.tile.name), tsk = `${camel(c.tile.skin)}Skin`;
  return {
    react: `import { Text, type TextProps } from "../ui/text/text";
import { ${sk}, ${tsk}, type ${P}Variant } from "../skin/skin";
import { LucideIcon } from "./lucide-icon";

export type ${P}Props = Omit<TextProps, "tag"> & { variant?: ${P}Variant };

/** Pill label: Text tag="span". */
export function ${P}({ variant = "default", className, ...rest }: ${P}Props) {
  return <Text tag="span" data-slot="badge" className={${sk}(variant, className)} {...rest} />;
}

/** Large icon tile for notices. */
export function ${T}({ icon, tone = "default", className }: { icon: string; tone?: "default" | "destructive"; className?: string }) {
  return (
    <Text tag="span" data-slot="icon-badge" className={${tsk}(tone, className)}>
      <LucideIcon name={icon} size="lg" />
    </Text>
  );
}
`,
    solid: `import { splitProps } from "solid-js";
import { Text, type TextProps } from "../ui/text/text.solid";
import { ${sk}, ${tsk}, type ${P}Variant } from "../skin/skin";
import { LucideIcon } from "./lucide-icon";

export type ${P}Props = Omit<TextProps, "tag"> & { variant?: ${P}Variant };

/** Pill label: Text tag="span". */
export function ${P}(props: ${P}Props) {
  const [l, rest] = splitProps(props, ["variant", "class", "className"]);
  return <Text tag="span" data-slot="badge" {...rest} class={${sk}(l.variant ?? "default", l.class ?? l.className)} />;
}

/** Large icon tile for notices. */
export function ${T}(props: { icon: string; tone?: "default" | "destructive"; class?: string }) {
  return (
    <Text tag="span" data-slot="icon-badge" class={${tsk}(props.tone ?? "default", props.class)}>
      <LucideIcon name={props.icon} size="lg" />
    </Text>
  );
}
`,
    vue: `<script setup lang="ts">
import Text from "../ui/text/Text.vue";
import { ${sk}, type ${P}Variant } from "../skin/skin";
defineOptions({ inheritAttrs: false });
const p = withDefaults(defineProps<{ variant?: ${P}Variant; class?: string }>(), { variant: "default" });
</script>
<template><Text tag="span" data-slot="badge" v-bind="$attrs" :class="${sk}(p.variant, p.class)"><slot /></Text></template>
`,
    vueTile: `<script setup lang="ts">
import Text from "../ui/text/Text.vue";
import { ${tsk} } from "../skin/skin";
import LucideIcon from "./LucideIcon.vue";
const p = withDefaults(defineProps<{ icon: string; tone?: "default" | "destructive"; class?: string }>(), { tone: "default" });
</script>
<template><Text tag="span" data-slot="icon-badge" :class="${tsk}(p.tone, p.class)"><LucideIcon :name="p.icon" size="lg" /></Text></template>
`,
    svelte: `<script lang="ts">
  import type { Snippet } from "svelte";
  import Text from "../ui/text/Text.svelte";
  import { ${sk}, type ${P}Variant } from "../skin/skin";
  let { variant = "default", class: className, children, ...rest }: { variant?: ${P}Variant; class?: string; children?: Snippet; [k: string]: unknown } = $props();
</script>

<Text tag="span" data-slot="badge" {...rest} class={${sk}(variant, className)}>{@render children?.()}</Text>
`,
    svelteTile: `<script lang="ts">
  import Text from "../ui/text/Text.svelte";
  import { ${tsk} } from "../skin/skin";
  import LucideIcon from "./LucideIcon.svelte";
  let { icon, tone = "default", class: className }: { icon: string; tone?: "default" | "destructive"; class?: string } = $props();
</script>

<Text tag="span" data-slot="icon-badge" class={${tsk}(tone, className)}><LucideIcon name={icon} size="lg" /></Text>
`,
  };
}

/** Bodies (no header / imports): the WC function, the templ component, the server macros. */
export function messageBodies(c: Message) {
  const P = pascal(c.name), n = camel(c.name), sk = `${camel(c.skin)}Skin`;
  return {
    wc: `export function ${n}(props: { tone?: Tone; icon?: string; role?: "alert" | "status"; id?: string; class?: string; [k: string]: unknown }, children: Children): Element {
  const { tone = "default", icon, role, class: className, ...rest } = props;
  const kids = [icon ? lucideIcon(icon) : null, ...(Array.isArray(children) ? children : [children])];
  return renderBox({ role: role ?? (tone === "destructive" ? "alert" : "status"), "aria-live": "polite", "data-slot": "alert", ...rest, class: ${sk}(tone, className) }, kids);
}
`,
    templ: `// ${P}: tone destructive → role=alert, otherwise role=status; aria-live polite.
templ ${P}(tone, iconName, id, testid, message string) {
	@box.Box(box.BoxProps{Class: ${P}Skin(tone), Attrs: A("role", map[bool]string{true: "alert", false: "status"}[tone == "destructive"], "aria-live", "polite", "data-slot", "alert", "id", id, "data-testid", testid)}) {
		if iconName != "" {
			@LucideIcon(iconName, "")
		}
		{ message }
	}
}
`,
    twig: `{%- macro ${n}(tone, icon, id, testid, message) -%}
{%- set c -%}{% if icon %}{{ _self.icon(icon) }}{% endif %}{{ message }}{%- endset -%}
{{ _self.box('', af_skin('alert', tone), {role: tone == 'destructive' ? 'alert' : 'status', 'aria-live': 'polite', 'data-slot': 'alert', id: id, 'data-testid': testid}, c) }}
{%- endmacro -%}`,
    latte: `{define ${n}, string $tone, string $icon, string $id, string $testid, $message}
{capture $c}{if $icon}{include icon, $icon}{/if}{$message}{/capture}
{include box, '', afSkin('alert', $tone), ['role' => $tone === 'destructive' ? 'alert' : 'status', 'aria-live' => 'polite', 'data-slot' => 'alert', 'id' => $id, 'data-testid' => $testid], $c}
{/define}`,
    jinja2: `{%- macro ${n}(tone, icon_name, id, testid, message) -%}
{%- set c -%}{% if icon_name %}{{ icon(icon_name) }}{% endif %}{{ message }}{%- endset -%}
{{ box('', af_skin('alert', tone), {'role': 'alert' if tone == 'destructive' else 'status', 'aria-live': 'polite', 'data-slot': 'alert', 'id': id, 'data-testid': testid}, c) }}
{%- endmacro -%}`,
  };
}

export function pillBodies(c: Pill) {
  const P = pascal(c.name), n = camel(c.name), sk = `${camel(c.skin)}Skin`, T = pascal(c.tile.name), t = camel(c.tile.name), tsk = `${camel(c.tile.skin)}Skin`;
  const snake = t.replace(/[A-Z]/g, (x) => "_" + x.toLowerCase());
  return {
    wc: `export function ${n}(variant: BadgeVariant, props: TextElementProps, children: Children): Element {
  const { class: className, ...rest } = props;
  return renderText({ tag: "span", "data-slot": "badge", ...rest, class: ${sk}(variant, className) }, children);
}

export function ${t}(icon: string, tone: "default" | "destructive" = "default"): Element {
  return renderText({ tag: "span", "data-slot": "icon-badge", class: ${tsk}(tone) }, [lucideIcon(icon, "lg")]);
}
`,
    templ: `templ ${P}(variant, testid, label string) {
	@text.Text(text.TextProps{Tag: "span", Class: ${P}Skin(variant), Attrs: A("data-slot", "badge", "data-testid", testid)}) {
		{ label }
	}
}

templ ${T}(iconName, tone string) {
	@text.Text(text.TextProps{Tag: "span", Class: ${T}Skin(tone), Attrs: A("data-slot", "icon-badge")}) {
		@LucideIcon(iconName, "lg")
	}
}
`,
    twig: `{%- macro ${n}(variant, testid, label) -%}
{{ _self.text('span', af_skin('badge', variant ?: 'default'), {'data-slot': 'badge', 'data-testid': testid}, af_esc(label)) }}
{%- endmacro -%}

{%- macro ${snake}(icon, tone) -%}
{{ _self.text('span', af_skin('iconBadge', tone ?: 'default'), {'data-slot': 'icon-badge'}, _self.icon(icon, 'lg')) }}
{%- endmacro -%}`,
    latte: `{define ${n}, string $variant, string $testid, $label}
{include text, 'span', afSkin('badge', $variant ?: 'default'), ['data-slot' => 'badge', 'data-testid' => $testid], afEsc($label)}
{/define}

{define ${t}, string $icon, string $tone = 'default'}
{capture $c}{include icon, $icon, 'lg'}{/capture}
{include text, 'span', afSkin('iconBadge', $tone ?: 'default'), ['data-slot' => 'icon-badge'], $c}
{/define}`,
    jinja2: `{%- macro ${n}(variant, testid, label) -%}
{{ text('span', af_skin('badge', variant or 'default'), {'data-slot': 'badge', 'data-testid': testid}, af_esc(label)) }}
{%- endmacro -%}

{%- macro ${snake}(icon_name, tone='default') -%}
{{ text('span', af_skin('iconBadge', tone or 'default'), {'data-slot': 'icon-badge'}, icon(icon_name, 'lg')) }}
{%- endmacro -%}`,
  };
}

/** Whole files (header added by src/components.ts). */
export function headingJs(c: Heading) {
  const P = pascal(c.name);
  return {
    react: `import { Text, type TextProps } from "../ui/text/text";
import { cn } from "../utils";
import { textSkin } from "../skin/skin";

export type ${P}Props = Omit<TextProps, "tag"> & { level?: 1 | 2 | 3; size?: "title" | "subtitle" };

/** Heading via the Text primitive (h1..h3). */
export function ${P}({ level = 1, size = level === 1 ? "title" : "subtitle", className, ...rest }: ${P}Props) {
  const tag = (["h1", "h2", "h3"] as const)[level - 1];
  return <Text tag={tag} className={cn(textSkin[size], className)} {...rest} />;
}
`,
    solid: `import { splitProps } from "solid-js";
import { Text, type TextProps } from "../ui/text/text.solid";
import { cn } from "../utils";
import { textSkin } from "../skin/skin";

export type ${P}Props = Omit<TextProps, "tag"> & { level?: 1 | 2 | 3; size?: "title" | "subtitle" };

/** Heading via the Text primitive (h1..h3). */
export function ${P}(props: ${P}Props) {
  const [l, rest] = splitProps(props, ["level", "size", "class", "className"]);
  const level = () => l.level ?? 1;
  return <Text tag={(["h1", "h2", "h3"] as const)[level() - 1]} {...rest} class={cn(textSkin[l.size ?? (level() === 1 ? "title" : "subtitle")], l.class ?? l.className)} />;
}
`,
    vue: `<script setup lang="ts">
import { computed } from "vue";
import Text from "../ui/text/Text.vue";
import { cn } from "../utils";
import { textSkin } from "../skin/skin";
defineOptions({ inheritAttrs: false });
const p = withDefaults(defineProps<{ level?: 1 | 2 | 3; size?: "title" | "subtitle"; class?: string }>(), { level: 1 });
const tag = computed(() => (["h1", "h2", "h3"] as const)[p.level - 1]);
const size = computed(() => p.size ?? (p.level === 1 ? "title" : "subtitle"));
</script>
<template><Text v-bind="{ ...$attrs, tag }" :class="cn(textSkin[size], p.class)"><slot /></Text></template>
`,
    svelte: `<script lang="ts">
  import type { Snippet } from "svelte";
  import Text from "../ui/text/Text.svelte";
  import { cn } from "../utils";
  import { textSkin } from "../skin/skin";
  let { level = 1, size, class: className, children, ...rest }: { level?: 1 | 2 | 3; size?: "title" | "subtitle"; class?: string; children?: Snippet; [k: string]: unknown } = $props();
  const tag = $derived((["h1", "h2", "h3"] as const)[level - 1]);
  const sz = $derived(size ?? (level === 1 ? "title" : "subtitle"));
</script>

<Text {tag} {...rest} class={cn(textSkin[sz], className)}>{@render children?.()}</Text>
`,
  };
}

export function headingBodies(c: Heading) {
  const P = pascal(c.name), n = camel(c.name), m = c.macro ?? n;
  return {
    wc: `export function ${n}(level: 1 | 2 | 3, props: TextElementProps, children: Children): Element {
  const { class: className, ...rest } = props;
  return renderText({ tag: (["h1", "h2", "h3"] as const)[level - 1], ...rest, class: cn(textSkin[level === 1 ? "title" : "subtitle"], className) }, children);
}
`,
    templ: `// ${P}: h1 (title size) or h2/h3 (subtitle size) via the Text primitive.
templ ${P}(level int, id, role, title string) {
	if level == 1 {
		@text.Text(text.TextProps{Tag: "h1", Class: TextTitle, Attrs: A("id", id, "role", role)}) {
			{ title }
		}
	} else {
		@text.Text(text.TextProps{Tag: "h2", Class: TextSubtitle, Attrs: A("id", id, "role", role)}) {
			{ title }
		}
	}
}
`,
    twig: `{%- macro ${m}(level, id, role, title) -%}
{{ _self.text(level == 1 ? 'h1' : 'h2', af_text(level == 1 ? 'title' : 'subtitle'), {id: id, role: role}, af_esc(title)) }}
{%- endmacro -%}`,
    latte: `{define ${m}, int $level, string $id, $role, $title}
{include text, $level === 1 ? 'h1' : 'h2', afText($level === 1 ? 'title' : 'subtitle'), ['id' => $id, 'role' => $role], afEsc($title)}
{/define}`,
    jinja2: `{%- macro ${m}(level, id, role, title) -%}
{{ text('h1' if level == 1 else 'h2', af_text('title' if level == 1 else 'subtitle'), {'id': id, 'role': role}, af_esc(title)) }}
{%- endmacro -%}`,
  };
}

/** Whole files (header added by src/components.ts). */
export function glyphJs(c: Glyph) {
  const P = pascal(c.name);
  return {
    react: `// Lucide glyph inside the UI8Kit Icon primitive (the span carries size, aria-hidden / role="img").
import { createElement } from "react";
import { Icon } from "../ui/icon/icon";
import type { IconSize } from "../ui/icon/icon.shared";
import { LUCIDE } from "./lucide-icons";

export type ${P}Props = { name: string; size?: IconSize; label?: string; className?: string };

export function ${P}({ name, size = "sm", label, className }: ${P}Props) {
  const nodes = LUCIDE[name] ?? LUCIDE["circle"] ?? [];
  return (
    <Icon size={size} label={label} className={className} data-lucide={name}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%" aria-hidden="true" focusable="false">
        {nodes.map(([tag, attrs], i) => createElement(tag, { key: i, ...attrs }))}
      </svg>
    </Icon>
  );
}
`,
    solid: `// Lucide glyph inside the UI8Kit Icon primitive (the span carries size, aria-hidden / role="img").
import { For } from "solid-js";
import { Dynamic } from "solid-js/web";
import { Icon } from "../ui/icon/icon.solid";
import type { IconSize } from "../ui/icon/icon.shared";
import { LUCIDE } from "./lucide-icons";

export type ${P}Props = { name: string; size?: IconSize; label?: string; class?: string };

export function ${P}(props: ${P}Props) {
  const nodes = () => LUCIDE[props.name] ?? LUCIDE["circle"] ?? [];
  return (
    <Icon size={props.size ?? "sm"} label={props.label} class={props.class} data-lucide={props.name}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="100%" height="100%" aria-hidden="true" {...{ focusable: "false" }}>
        <For each={nodes()}>{([tag, attrs]) => <Dynamic component={tag} {...attrs} />}</For>
      </svg>
    </Icon>
  );
}
`,
    vue: `<script setup lang="ts">
// Lucide glyph inside the UI8Kit Icon primitive (the span carries size, aria-hidden / role="img").
import { computed } from "vue";
import Icon from "../ui/icon/Icon.vue";
import type { IconSize } from "../ui/icon/icon.shared";
import { LUCIDE } from "./lucide-icons";
const props = withDefaults(defineProps<{ name: string; size?: IconSize; label?: string; class?: string }>(), { size: "sm" });
const nodes = computed(() => LUCIDE[props.name] ?? LUCIDE["circle"] ?? []);
</script>
<template>
  <Icon :size="props.size" :label="props.label" :class="props.class" :data-lucide="props.name">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="100%" height="100%" aria-hidden="true" focusable="false">
      <component :is="tag" v-for="([tag, attrs], i) in nodes" :key="i" v-bind="attrs" />
    </svg>
  </Icon>
</template>
`,
    svelte: `<script lang="ts">
  // Lucide glyph inside the UI8Kit Icon primitive (the span carries size, aria-hidden / role="img").
  import Icon from "../ui/icon/Icon.svelte";
  import type { IconSize } from "../ui/icon/icon.shared";
  import { LUCIDE } from "./lucide-icons";
  let { name, size = "sm", label, class: className }: { name: string; size?: IconSize; label?: string; class?: string } = $props();
  const nodes = $derived(LUCIDE[name] ?? LUCIDE["circle"] ?? []);
</script>

<Icon {size} {label} class={className} data-lucide={name}>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="100%" height="100%" aria-hidden="true" focusable="false">
    {#each nodes as [tag, attrs], i (i)}<svelte:element this={tag} {...attrs} />{/each}
  </svg>
</Icon>
`,
  };
}

export function glyphBodies(c: Glyph) {
  const P = pascal(c.name), n = camel(c.name), m = c.macro ?? n;
  return {
    wc: `const SVG = "http://www.w3.org/2000/svg";

/** Lucide glyph inside the Icon primitive (span carries size + aria-hidden / role="img"). */
export function ${n}(name: string, size: IconSize = "sm", label?: string, className?: string): Element {
  const svg = document.createElementNS(SVG, "svg");
  for (const [k, v] of Object.entries({ xmlns: SVG, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", width: "100%", height: "100%", "aria-hidden": "true", focusable: "false" })) svg.setAttribute(k, v);
  for (const [tag, attrs] of LUCIDE[name] ?? LUCIDE["circle"] ?? []) {
    const n = document.createElementNS(SVG, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    svg.appendChild(n);
  }
  return renderIcon({ size, label, class: className, "data-lucide": name }, [svg]);
}
`,
    templ: `// ${P}: a Lucide glyph inside the Icon primitive. Size xs|sm|md|lg|xl (default sm).
templ ${P}(name, size string) {
	@icon.Icon(icon.IconProps{Size: or(size, "sm"), Attrs: A("data-lucide", name)}) {
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="100%" height="100%" aria-hidden="true" focusable="false">
			@templ.Raw(lucideInner(name))
		</svg>
	}
}
`,
    twig: `{%- macro ${m}(name, size) -%}
{%- set svg -%}<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="100%" height="100%" aria-hidden="true" focusable="false">{{ af_lucide(name) }}</svg>{%- endset -%}
{{ include('ui/icon/Icon.html.twig', {size: size ?: 'sm', attrs: {'data-lucide': name}, children: svg}, with_context = false) }}
{%- endmacro -%}`,
    latte: `{define ${m}, string $name, string $size = 'sm'}
{capture $svg}<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="100%" height="100%" aria-hidden="true" focusable="false">{afLucide($name)}</svg>{/capture}
{include '../ui/icon/Icon.latte', size: $size ?: 'sm', attrs: ['data-lucide' => $name], children: (string) $svg}
{/define}`,
    jinja2: `{%- macro ${m}(name, size='sm') -%}
{%- set svg -%}<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="100%" height="100%" aria-hidden="true" focusable="false">{{ af_lucide(name) }}</svg>{%- endset -%}
{{ prim('ui/icon/icon.html.j2', {'Size': size or 'sm', 'Attrs': {'data-lucide': name}}, svg) }}
{%- endmacro -%}`,
  };
}

/** layout (Stack, Group, Form): whole files per JS runtime, keyed by the packages/ui-relative path. */
export function layoutJs(): Record<string, string> {
  return {
    "react/src/components/layout.tsx": `// Layout helpers: Stack/Group over Box (8px-step gaps) and Form over the Form primitive (+ error context).
import { Box, type BoxProps } from "../ui/box/box";
import { Form as UiForm, type FormProps as UiFormProps } from "../ui/form/form";
import { cn } from "../utils";
import { FormErrorContext } from "./field";

type Gap = "0" | "2" | "4" | "6" | "8";
const gapCls: Record<Gap, string> = { "0": "gap-0", "2": "gap-2", "4": "gap-4", "6": "gap-6", "8": "gap-8" };
const alignCls = { start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch" } as const;
const justifyCls = { start: "justify-start", center: "justify-center", end: "justify-end", between: "justify-between" } as const;

export type StackProps = BoxProps & { gap?: Gap; align?: keyof typeof alignCls; justify?: keyof typeof justifyCls };

/** Vertical flex stack. */
export function Stack({ gap = "4", align = "stretch", justify, className, ...rest }: StackProps) {
  return <Box className={cn("flex flex-col", gapCls[gap], alignCls[align], justify && justifyCls[justify], className)} {...rest} />;
}

/** Horizontal flex row. */
export function Group({ gap = "2", align = "center", justify, className, ...rest }: StackProps) {
  return <Box className={cn("flex min-w-0", gapCls[gap], alignCls[align], justify && justifyCls[justify], className)} {...rest} />;
}

export type FormProps = Omit<UiFormProps, "method"> & {
  method?: "get" | "post";
  /** id of the server error element; every Field inside points aria-describedby at it and sets aria-invalid. */
  errorId?: string;
};

/** The UI8Kit Form primitive with the Authfly grid and the form-level error context. */
export function Form({ method = "post", className, errorId, ...rest }: FormProps) {
  return (
    <FormErrorContext.Provider value={errorId}>
      <UiForm method={method} className={cn("grid gap-4", className)} {...rest} />
    </FormErrorContext.Provider>
  );
}
`,
    "solid/src/components/layout.tsx": `// Stack/Group over Box (8px-step gaps) and Form over the Form primitive (+ form-level error context).
import { createContext, splitProps, type JSX } from "solid-js";
import { Box, type BoxProps } from "../ui/box/box.solid";
import { Form as UiForm, type FormProps as UiFormProps } from "../ui/form/form.solid";
import { cn } from "../utils";

type Gap = "0" | "2" | "4" | "6" | "8";
const gapCls: Record<Gap, string> = { "0": "gap-0", "2": "gap-2", "4": "gap-4", "6": "gap-6", "8": "gap-8" };
const alignCls = { start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch" } as const;
const justifyCls = { start: "justify-start", center: "justify-center", end: "justify-end", between: "justify-between" } as const;

export type StackProps = BoxProps & { gap?: Gap; align?: keyof typeof alignCls; justify?: keyof typeof justifyCls };

function flex(base: string, dGap: Gap, dAlign: keyof typeof alignCls) {
  return (props: StackProps) => {
    const [l, rest] = splitProps(props, ["gap", "align", "justify", "class", "className"]);
    return <Box {...rest} class={cn(base, gapCls[l.gap ?? dGap], alignCls[l.align ?? dAlign], l.justify && justifyCls[l.justify], l.class ?? l.className)} />;
  };
}
/** Vertical flex stack. */
export const Stack = flex("flex flex-col", "4", "stretch");
/** Horizontal flex row. */
export const Group = flex("flex min-w-0", "2", "center");

/** Id of the form-level (server) error element, provided by <Form errorId>. */
export const FormErrorContext = createContext<() => string | undefined>(() => undefined);

export type FormProps = Omit<UiFormProps, "method"> & { method?: "get" | "post"; errorId?: string; children?: JSX.Element };

/** The UI8Kit Form primitive with the Authfly grid and the form-level error context. */
export function Form(props: FormProps) {
  const [l, rest] = splitProps(props, ["method", "errorId", "class", "className", "children"]);
  return (
    <FormErrorContext.Provider value={() => l.errorId}>
      <UiForm {...rest} method={l.method ?? "post"} class={cn("grid gap-4", l.class ?? l.className)}>{l.children}</UiForm>
    </FormErrorContext.Provider>
  );
}
`,
    "vue/src/components/Stack.vue": `<script setup lang="ts">
import Box from "../ui/box/Box.vue";
import { cn } from "../utils";
import { gapCls, alignCls, justifyCls, type Gap, type Align, type Justify } from "./layout";
defineOptions({ inheritAttrs: false });
const p = withDefaults(defineProps<{ gap?: Gap; align?: Align; justify?: Justify; class?: string }>(), { gap: "4", align: "stretch" });
</script>
<template><Box v-bind="$attrs" :class="cn('flex flex-col', gapCls[p.gap], alignCls[p.align], p.justify && justifyCls[p.justify], p.class)"><slot /></Box></template>
`,
    "vue/src/components/Group.vue": `<script setup lang="ts">
import Box from "../ui/box/Box.vue";
import { cn } from "../utils";
import { gapCls, alignCls, justifyCls, type Gap, type Align, type Justify } from "./layout";
defineOptions({ inheritAttrs: false });
const p = withDefaults(defineProps<{ gap?: Gap; align?: Align; justify?: Justify; class?: string }>(), { gap: "2", align: "center" });
</script>
<template><Box v-bind="$attrs" :class="cn('flex min-w-0', gapCls[p.gap], alignCls[p.align], p.justify && justifyCls[p.justify], p.class)"><slot /></Box></template>
`,
    "vue/src/components/Form.vue": `<script setup lang="ts">
// The UI8Kit Form primitive with the Authfly grid; provides the form-level error id to every Field inside.
import { provide, toRef } from "vue";
import UiForm from "../ui/form/Form.vue";
import { cn } from "../utils";
import { FormErrorKey } from "./context";
defineOptions({ inheritAttrs: false });
const p = withDefaults(defineProps<{ method?: "get" | "post"; errorId?: string; class?: string }>(), { method: "post" });
provide(FormErrorKey, toRef(p, "errorId"));
</script>
<template><UiForm v-bind="$attrs" :method="p.method" :class="cn('grid gap-4', p.class)"><slot /></UiForm></template>
`,
    "vue/src/components/layout.ts": `export type Gap = "0" | "2" | "4" | "6" | "8";
export const gapCls: Record<Gap, string> = { "0": "gap-0", "2": "gap-2", "4": "gap-4", "6": "gap-6", "8": "gap-8" };
export const alignCls = { start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch" } as const;
export const justifyCls = { start: "justify-start", center: "justify-center", end: "justify-end", between: "justify-between" } as const;
export type Align = keyof typeof alignCls;
export type Justify = keyof typeof justifyCls;
`,
    "svelte/src/components/Stack.svelte": `<script lang="ts">
  import type { Snippet } from "svelte";
  import Box from "../ui/box/Box.svelte";
  import { cn } from "../utils";
  import { gapCls, alignCls, justifyCls, type Gap, type Align, type Justify } from "./layout";
  let { gap = "4", align = "stretch", justify, class: className, children, ...rest }: { gap?: Gap; align?: Align; justify?: Justify; class?: string; children?: Snippet; [k: string]: unknown } = $props();
</script>

<Box {...rest} class={cn("flex flex-col", gapCls[gap], alignCls[align], justify && justifyCls[justify], className)}>{@render children?.()}</Box>
`,
    "svelte/src/components/Group.svelte": `<script lang="ts">
  import type { Snippet } from "svelte";
  import Box from "../ui/box/Box.svelte";
  import { cn } from "../utils";
  import { gapCls, alignCls, justifyCls, type Gap, type Align, type Justify } from "./layout";
  let { gap = "2", align = "center", justify, class: className, children, ...rest }: { gap?: Gap; align?: Align; justify?: Justify; class?: string; children?: Snippet; [k: string]: unknown } = $props();
</script>

<Box {...rest} class={cn("flex min-w-0", gapCls[gap], alignCls[align], justify && justifyCls[justify], className)}>{@render children?.()}</Box>
`,
    "svelte/src/components/Form.svelte": `<script lang="ts">
  // The UI8Kit Form primitive with the Authfly grid; shares the form-level error id with every Field inside.
  import type { Snippet } from "svelte";
  import UiForm from "../ui/form/Form.svelte";
  import { cn } from "../utils";
  import { setFormError } from "./context";
  let { method = "post", errorId, class: className, children, ...rest }: { method?: "get" | "post"; errorId?: string; class?: string; children?: Snippet; [k: string]: unknown } = $props();
  setFormError(() => errorId);
</script>

<UiForm {...rest} {method} class={cn("grid gap-4", className)}>{@render children?.()}</UiForm>
`,
    "svelte/src/components/layout.ts": `export type Gap = "0" | "2" | "4" | "6" | "8";
export const gapCls: Record<Gap, string> = { "0": "gap-0", "2": "gap-2", "4": "gap-4", "6": "gap-6", "8": "gap-8" };
export const alignCls = { start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch" } as const;
export const justifyCls = { start: "justify-start", center: "justify-center", end: "justify-end", between: "justify-between" } as const;
export type Align = keyof typeof alignCls;
export type Justify = keyof typeof justifyCls;
`,
  };
}

/** layout bodies: WC module body, templ components, server prim (box/text) + layout regions. */
export function layoutBodies() {
  return {
    wc: `type Gap = "0" | "2" | "4" | "6" | "8";
const gapCls: Record<Gap, string> = { "0": "gap-0", "2": "gap-2", "4": "gap-4", "6": "gap-6", "8": "gap-8" };
const alignCls = { start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch" } as const;
const justifyCls = { start: "justify-start", center: "justify-center", end: "justify-end", between: "justify-between" } as const;
export type FlexProps = BoxElementProps & { gap?: Gap; align?: keyof typeof alignCls; justify?: keyof typeof justifyCls };
const flex = (base: string, dGap: Gap, dAlign: keyof typeof alignCls) => (props: FlexProps, children: Children): Element => {
  const { gap = dGap, align = dAlign, justify, class: className, ...rest } = props;
  return renderBox({ ...rest, class: cn(base, gapCls[gap], alignCls[align], justify && justifyCls[justify], className) }, children);
};
export const stack = flex("flex flex-col", "4", "stretch");
export const group = flex("flex min-w-0", "2", "center");

/** Form primitive with the Authfly grid. errorId (server error element) is wired into fields by field(). */
export function form(props: { action?: string; method?: "get" | "post"; class?: string; [k: string]: unknown }, children: Children): Element {
  const { method = "post", class: className, ...rest } = props;
  return renderForm({ ...rest, method, class: cn("grid gap-4", className) }, children);
}
`,
    templ: `// Stack: vertical flex; gap 0|2|4|6|8 (default 4), align start|center|end|stretch (default stretch).
templ Stack(gap, align, justify, class string, attrs templ.Attributes) {
	@box.Box(box.BoxProps{Class: cn("flex flex-col", gapCls[or(gap, "4")], alignCls[or(align, "stretch")], justifyCls[justify], class), Attrs: attrs}) {
		{ children... }
	}
}

// Group: horizontal flex row; gap default 2, align default center.
templ Group(gap, align, justify, class string, attrs templ.Attributes) {
	@box.Box(box.BoxProps{Class: cn("flex min-w-0", gapCls[or(gap, "2")], alignCls[or(align, "center")], justifyCls[justify], class), Attrs: attrs}) {
		{ children... }
	}
}

// Form: the Form primitive (method post) with the Authfly grid. The form-level error id goes to each Field.
templ Form(action, class string, attrs templ.Attributes) {
	@form.Form(form.FormProps{Action: action, Method: "post", Class: cn("grid gap-4", class), Attrs: attrs}) {
		{ children... }
	}
}
`,
    twig: { prim: `{%- macro box(tag, class, attrs, children) -%}
{{ include('ui/box/Box.html.twig', {tag: tag ?: '', class: class ?: '', attrs: af_attrs(attrs ?? {}), children: children ?? ''}, with_context = false) }}
{%- endmacro -%}

{%- macro text(tag, class, attrs, children) -%}
{{ include('ui/text/Text.html.twig', {tag: tag ?: '', class: class ?: '', attrs: af_attrs(attrs ?? {}), children: children ?? ''}, with_context = false) }}
{%- endmacro -%}`, layout: `{%- macro stack(gap, align, justify, class, attrs, children) -%}
{{ _self.box('', af_cn('flex flex-col', af_gap(gap, '4'), af_align(align, 'stretch'), af_justify(justify), class), attrs, children) }}
{%- endmacro -%}

{%- macro group(gap, align, justify, class, attrs, children) -%}
{{ _self.box('', af_cn('flex min-w-0', af_gap(gap, '2'), af_align(align, 'center'), af_justify(justify), class), attrs, children) }}
{%- endmacro -%}

{#- form: the Form primitive (method post) with the Authfly grid; the form error id is passed to each field. -#}
{%- macro form(action, class, attrs, children) -%}
{{ include('ui/form/Form.html.twig', {action: action, method: 'post', class: af_cn('grid gap-4', class), attrs: af_attrs(attrs ?? {}), children: children}, with_context = false) }}
{%- endmacro -%}` },
    latte: { prim: `{define box, string $tag = '', string $class = '', array $attrs = [], $children = ''}
{include '../ui/box/Box.latte', tag: $tag, class: $class, attrs: afAttrs($attrs), children: (string) $children}
{/define}

{define text, string $tag = '', string $class = '', array $attrs = [], $children = ''}
{include '../ui/text/Text.latte', tag: $tag, class: $class, attrs: afAttrs($attrs), children: (string) $children}
{/define}`, layout: `{define stack, string $gap = '', string $align = '', string $justify = '', string $class = '', array $attrs = [], $children = ''}
{include box, '', afCn('flex flex-col', afGap($gap, '4'), afAlign($align, 'stretch'), afJustify($justify), $class), $attrs, $children}
{/define}

{define group, string $gap = '', string $align = '', string $justify = '', string $class = '', array $attrs = [], $children = ''}
{include box, '', afCn('flex min-w-0', afGap($gap, '2'), afAlign($align, 'center'), afJustify($justify), $class), $attrs, $children}
{/define}

{* form: the Form primitive (method post) with the Authfly grid; the form error id is passed to each field. *}
{define form, string $action = '', string $class = '', array $attrs = [], $children = ''}
{include '../ui/form/Form.latte', action: $action, method: 'post', class: afCn('grid gap-4', $class), attrs: afAttrs($attrs), children: (string) $children}
{/define}` },
    jinja2: { prim: `{%- macro box(tag='', cls='', attrs={}, children='') -%}
{{ prim('ui/box/box.html.j2', {'Tag': tag, 'Class': cls, 'Attrs': af_attrs(attrs)}, children) }}
{%- endmacro -%}

{%- macro text(tag='', cls='', attrs={}, children='') -%}
{{ prim('ui/text/text.html.j2', {'Tag': tag, 'Class': cls, 'Attrs': af_attrs(attrs)}, children) }}
{%- endmacro -%}`, layout: `{%- macro stack(gap='', align='', justify='', cls='', attrs={}, children='') -%}
{{ box('', af_cn('flex flex-col', af_gap(gap, '4'), af_align(align, 'stretch'), af_justify(justify), cls), attrs, children) }}
{%- endmacro -%}

{%- macro group(gap='', align='', justify='', cls='', attrs={}, children='') -%}
{{ box('', af_cn('flex min-w-0', af_gap(gap, '2'), af_align(align, 'center'), af_justify(justify), cls), attrs, children) }}
{%- endmacro -%}

{#- form: the Form primitive (method post) with the Authfly grid; the form error id is passed to each field. -#}
{%- macro form(action='', cls='', attrs={}, children='') -%}
{{ prim('ui/form/form.html.j2', {'Action': action, 'Method': 'post', 'Class': af_cn('grid gap-4', cls), 'Attrs': af_attrs(attrs)}, children) }}
{%- endmacro -%}` },
  };
}

/** field (Field + Hidden + form-error context): whole files keyed by packages/ui path (header added by src/components.ts). */
export function fieldFiles(): Record<string, string> {
  return {
    "react/src/components/field.tsx": `// A form field: label, control (children), hint and error text. \`htmlFor\` ties the label to the control id.
// The control (the child element whose id === htmlFor, searched two levels deep) gets:
//   aria-describedby = its own ids + \`\${htmlFor}-hint\` + \`\${htmlFor}-error\` + the form-level error (FormErrorContext)
//   aria-invalid="true" when the field has an error or the form reports a server error.
import { Children, cloneElement, createContext, isValidElement, useContext, type ReactElement, type ReactNode } from "react";
import { Box } from "../ui/box/box";
import { Input } from "../ui/input/input";
import { Label } from "../ui/label/label";
import { Text } from "../ui/text/text";
import { cn } from "../utils";
import { labelSkin, textSkin } from "../skin/skin";

/** Id of the form-level (server) error element; set by <Form errorId>. */
export const FormErrorContext = createContext<string | undefined>(undefined);

export type FieldProps = { label: string; htmlFor: string; hint?: string; error?: string; className?: string; children?: ReactNode };

type Ctl = ReactElement<{ id?: string; children?: ReactNode; "aria-describedby"?: string; "aria-invalid"?: unknown }>;

function wire(node: ReactNode, id: string, describedBy: string[], invalid: boolean, depth = 0): ReactNode {
  return Children.map(node, (child) => {
    if (!isValidElement(child)) return child;
    const el = child as Ctl;
    if (el.props.id === id) {
      const ids = [el.props["aria-describedby"], ...describedBy].filter(Boolean).join(" ");
      return cloneElement(el, { "aria-describedby": ids || undefined, "aria-invalid": invalid ? "true" : el.props["aria-invalid"] } as Partial<Ctl["props"]>);
    }
    if (depth < 2 && el.props.children !== undefined) return cloneElement(el, {}, wire(el.props.children, id, describedBy, invalid, depth + 1));
    return el;
  });
}

export function Field({ label, htmlFor, hint, error, className, children }: FieldProps) {
  const formError = useContext(FormErrorContext);
  const hintId = hint ? \`\${htmlFor}-hint\` : undefined;
  const errorId = error ? \`\${htmlFor}-error\` : undefined;
  const describedBy = [hintId, errorId, formError].filter((x): x is string => !!x);
  return (
    <Box className={cn("flex min-w-0 flex-col gap-2", className)}>
      <Label htmlFor={htmlFor} className={labelSkin()}>{label}</Label>
      {wire(children, htmlFor, describedBy, !!error || !!formError)}
      {hint ? <Text id={hintId} className={textSkin.hint}>{hint}</Text> : null}
      {error ? <Text id={errorId} className="text-xs font-semibold text-destructive">{error}</Text> : null}
    </Box>
  );
}

/** Hidden input: the value is always emitted (an empty csrf / token included). */
export function Hidden({ name, value }: { name: string; value: string }) {
  return <Input type="hidden" name={name} value={value} />;
}
`,
    "solid/src/components/field.tsx": `// A form field: label, control, hint and error. \`children\` is a function receiving { describe, invalid }:
// set them on the control (aria-describedby / aria-invalid). describedby = own ids + hint + field error + form error.
import { Show, useContext, type JSX } from "solid-js";
import { Box } from "../ui/box/box.solid";
import { Input } from "../ui/input/input.solid";
import { Label } from "../ui/label/label.solid";
import { Text } from "../ui/text/text.solid";
import { cn } from "../utils";
import { labelSkin, textSkin } from "../skin/skin";
import { FormErrorContext } from "./layout";

export type FieldControl = { describe: (own?: string) => string | undefined; invalid: "true" | undefined };
export type FieldProps = { label: string; htmlFor: string; hint?: string; error?: string; class?: string; children: (f: FieldControl) => JSX.Element };

export function Field(props: FieldProps) {
  const formError = useContext(FormErrorContext);
  const hintId = () => (props.hint ? \`\${props.htmlFor}-hint\` : undefined);
  const errorId = () => (props.error ? \`\${props.htmlFor}-error\` : undefined);
  const ctl: FieldControl = {
    describe: (own) => [own, hintId(), errorId(), formError()].filter(Boolean).join(" ") || undefined,
    get invalid() { return props.error || formError() ? "true" : undefined; },
  };
  return (
    <Box class={cn("flex min-w-0 flex-col gap-2", props.class)}>
      <Label for={props.htmlFor} class={labelSkin()}>{props.label}</Label>
      {props.children(ctl)}
      <Show when={props.hint}><Text id={hintId()} class={textSkin.hint}>{props.hint}</Text></Show>
      <Show when={props.error}><Text id={errorId()} class="text-xs font-semibold text-destructive">{props.error}</Text></Show>
    </Box>
  );
}

/** Hidden input: the value is always emitted (an empty csrf / token included). */
export const Hidden = (props: { name: string; value: string }) => <Input type="hidden" name={props.name} value={props.value} />;
`,
    "vue/src/components/Field.vue": `<script setup lang="ts">
// A form field: label, control (default slot), hint and error. The slot receives \`describe(ownIds?)\` and \`invalid\`:
// bind them on the control as :aria-describedby / :aria-invalid. describedby = own ids + hint + field error + form error.
import { computed, inject } from "vue";
import Box from "../ui/box/Box.vue";
import Label from "../ui/label/Label.vue";
import Text from "../ui/text/Text.vue";
import { cn } from "../utils";
import { labelSkin, textSkin } from "../skin/skin";
import { FormErrorKey } from "./context";
const p = defineProps<{ label: string; htmlFor: string; hint?: string; error?: string; class?: string }>();
const formError = inject(FormErrorKey, undefined);
const hintId = computed(() => (p.hint ? \`\${p.htmlFor}-hint\` : undefined));
const errorId = computed(() => (p.error ? \`\${p.htmlFor}-error\` : undefined));
const invalid = computed(() => (p.error || formError?.value ? "true" : undefined));
const describe = (own?: string) => [own, hintId.value, errorId.value, formError?.value].filter(Boolean).join(" ") || undefined;
</script>
<template>
  <Box :class="cn('flex min-w-0 flex-col gap-2', p.class)">
    <Label :for="p.htmlFor" :class="labelSkin()">{{ p.label }}</Label>
    <slot :describe="describe" :invalid="invalid" />
    <Text v-if="p.hint" :id="hintId" :class="textSkin.hint">{{ p.hint }}</Text>
    <Text v-if="p.error" :id="errorId" class="text-xs font-semibold text-destructive">{{ p.error }}</Text>
  </Box>
</template>
`,
    "vue/src/components/context.ts": `import type { InjectionKey, Ref } from "vue";
/** Id of the form-level (server) error element, provided by <Form :error-id>. */
export const FormErrorKey: InjectionKey<Ref<string | undefined>> = Symbol("authfly-form-error");
`,
    "svelte/src/components/Field.svelte": `<script lang="ts" module>
  export type FieldControl = { describe: (own?: string) => string | undefined; invalid: "true" | undefined };
</script>

<script lang="ts">
  // A form field: label, control (children snippet), hint and error. The snippet receives { describe, invalid }:
  // spread them on the control (aria-describedby / aria-invalid). describedby = own ids + hint + field error + form error.
  import type { Snippet } from "svelte";
  import Box from "../ui/box/Box.svelte";
  import Label from "../ui/label/Label.svelte";
  import Text from "../ui/text/Text.svelte";
  import { cn } from "../utils";
  import { labelSkin, textSkin } from "../skin/skin";
  import { getFormError } from "./context";
  let { label, htmlFor, hint, error, class: className, children }: { label: string; htmlFor: string; hint?: string; error?: string; class?: string; children: Snippet<[FieldControl]> } = $props();
  const formError = getFormError();
  const hintId = $derived(hint ? \`\${htmlFor}-hint\` : undefined);
  const errorId = $derived(error ? \`\${htmlFor}-error\` : undefined);
  const ctl: FieldControl = $derived({
    describe: (own?: string) => [own, hintId, errorId, formError].filter(Boolean).join(" ") || undefined,
    invalid: error || formError ? "true" : undefined,
  });
</script>

<Box class={cn("flex min-w-0 flex-col gap-2", className)}>
  <Label for={htmlFor} class={labelSkin()}>{label}</Label>
  {@render children(ctl)}
  {#if hint}<Text id={hintId} class={textSkin.hint}>{hint}</Text>{/if}
  {#if error}<Text id={errorId} class="text-xs font-semibold text-destructive">{error}</Text>{/if}
</Box>
`,
    "svelte/src/components/context.ts": `import { getContext, setContext } from "svelte";
const KEY = Symbol("authfly-form-error");
/** Form-level (server) error id, set by <Form errorId>; a getter so it stays reactive. */
export const setFormError = (get: () => string | undefined) => setContext(KEY, get);
export const getFormError = (): string | undefined => (getContext<(() => string | undefined) | undefined>(KEY) ?? (() => undefined))();
`,
    "webcomponent/src/components/field.ts": `// Field (label + control + hint + error, aria wiring) and the hidden input, over the UI8Kit 3 *.wc.ts primitives.
import { renderBox } from "../ui/box/box.wc";
import { renderText } from "../ui/text/text.wc";
import { renderLabel } from "../ui/label/label.wc";
import { renderInput as input } from "../ui/input/input.wc";
import { cn } from "../utils";
import { labelSkin, textSkin } from "../skin/skin";

export type FieldControl = { describe: (own?: string) => string | undefined; invalid: "true" | undefined };

/** Label + control + hint + error. \`control\` receives { describe, invalid } to set aria-describedby / aria-invalid. */
export function field(opts: { label: string; htmlFor: string; hint?: string; error?: string; formError?: string; class?: string }, control: (f: FieldControl) => Element): Element {
  const hintId = opts.hint ? \`\${opts.htmlFor}-hint\` : undefined;
  const errorId = opts.error ? \`\${opts.htmlFor}-error\` : undefined;
  const f: FieldControl = {
    describe: (own) => [own, hintId, errorId, opts.formError].filter(Boolean).join(" ") || undefined,
    invalid: opts.error || opts.formError ? "true" : undefined,
  };
  return renderBox({ class: cn("flex min-w-0 flex-col gap-2", opts.class) }, [
    renderLabel({ for: opts.htmlFor, class: labelSkin() }, [opts.label]),
    control(f),
    opts.hint ? renderText({ id: hintId, class: textSkin.hint }, [opts.hint]) : null,
    opts.error ? renderText({ id: errorId, class: "text-xs font-semibold text-destructive" }, [opts.error]) : null,
  ]);
}

/** Hidden input: the value is always emitted (an empty csrf / token included). */
export const hidden = (name: string, value: string) => input({ type: "hidden", name, value });
`,
    "templ/authfly/field.templ": `package authfly

import (
	"github.com/authfly/authkit/packages/ui/templ/ui/box"
	"github.com/authfly/authkit/packages/ui/templ/ui/input"
	"github.com/authfly/authkit/packages/ui/templ/ui/label"
	"github.com/authfly/authkit/packages/ui/templ/ui/text"
)

// Hidden: value is always emitted, an empty csrf/token included (InputProps.Value is *string: nil = no attribute).
templ Hidden(name, value string) {
	@input.Input(input.InputProps{Type: "hidden", Name: name, Value: &value})
}

// FieldControl tells the control what to put in aria-describedby / aria-invalid.
type FieldControl struct{ hint, err, form string; Invalid string }

// Describe returns the control's aria-describedby: own ids + hint + field error + form error.
func (f FieldControl) Describe(own ...string) string {
	return describe(append(own, f.hint, f.err, f.form)...)
}

type FieldProps struct {
	Label, HtmlFor, Hint, Error, FormError, Class string
}

func fieldControl(p FieldProps) FieldControl {
	f := FieldControl{form: p.FormError}
	if p.Hint != "" {
		f.hint = p.HtmlFor + "-hint"
	}
	if p.Error != "" {
		f.err = p.HtmlFor + "-error"
	}
	if p.Error != "" || p.FormError != "" {
		f.Invalid = "true"
	}
	return f
}

// Field: label + control(f) + hint + error.
templ Field(p FieldProps, control func(FieldControl) templ.Component) {
	@box.Box(box.BoxProps{Class: cn("flex min-w-0 flex-col gap-2", p.Class)}) {
		@label.Label(label.LabelProps{For: p.HtmlFor, Class: LabelSkin()}) {
			{ p.Label }
		}
		@control(fieldControl(p))
		if p.Hint != "" {
			@text.Text(text.TextProps{Class: TextHint, Attrs: A("id", p.HtmlFor+"-hint")}) {
				{ p.Hint }
			}
		}
		if p.Error != "" {
			@text.Text(text.TextProps{Class: "text-xs font-semibold text-destructive", Attrs: A("id", p.HtmlFor+"-error")}) {
				{ p.Error }
			}
		}
	}
}

// TextInput: Input primitive with the Authfly skin and the Field wiring.
func TextInput(f FieldControl, typ, name, autocomplete, id string, required bool, own string, extra ...string) templ.Component {
	return input.Input(input.InputProps{Type: typ, Name: name, ID: id, Required: required, Class: InputSkin(),
		AriaDescribedBy: f.Describe(own), AriaInvalid: f.Invalid, Attrs: A(append([]string{"autocomplete", autocomplete, "data-testid", "field"}, extra...)...)})
}
`,
  };
}

/** field server regions: the hidden macro and the field macro (Twig, Latte, Jinja2). */
export function fieldBodies() {
  return {
    twig: { hidden: `{#- hidden: value always emitted, an empty one included (the primitive omits only null). -#}
{%- macro hidden(name, value) -%}
{{ include('ui/input/Input.html.twig', {type: 'hidden', name: name, value: value ?? ''}, with_context = false) }}
{%- endmacro -%}`, field: `{#- field: label + Input + hint + error. f = {label, for, hint, error, formError, input: Input props, describe: own ids,
    suffix: trusted html placed after the input in a Group}. aria-describedby = own + hint + error + form error;
    aria-invalid="true" when the field or the form shows an error. -#}
{%- macro field(f) -%}
{%- set hintId = f.hint ?? '' ? f.for ~ '-hint' : null -%}
{%- set errId = f.error ?? '' ? f.for ~ '-error' : null -%}
{%- set wired = (f.input|default({}))|merge({id: f.for, class: af_skin('input'), ariaDescribedBy: af_describe(f.describe ?? null, hintId, errId, f.formError ?? null), ariaInvalid: ((f.error ?? '') or (f.formError ?? '')) ? 'true' : null, attrs: af_attrs((f.input.attrs ?? {})|merge({'data-testid': 'field'}))}) -%}
{%- set ctl -%}{{ include('ui/input/Input.html.twig', wired, with_context = false) }}{%- endset -%}
{%- if f.suffix ?? '' -%}{%- set ctl = _self.group('2', '', '', '', {}, ctl ~ f.suffix) -%}{%- endif -%}
{%- set lbl -%}{{ include('ui/label/Label.html.twig', {htmlFor: f.for, class: af_skin('label'), children: af_esc(f.label)}, with_context = false) }}{%- endset -%}
{%- set c -%}
{{ lbl }}{{ ctl }}
{%- if hintId %}{{ _self.text('', af_text('hint'), {id: hintId}, af_esc(f.hint)) }}{% endif -%}
{%- if errId %}{{ _self.text('', 'text-xs font-semibold text-destructive', {id: errId}, af_esc(f.error)) }}{% endif -%}
{%- endset -%}
{{ _self.box('', 'flex min-w-0 flex-col gap-2', {}, c) }}
{%- endmacro -%}` },
    latte: { hidden: `{* hidden: value always emitted, an empty one included (the primitive omits only null). *}
{define hidden, string $name, $value = ''}
{include '../ui/input/Input.latte', type: 'hidden', name: $name, value: (string) $value}
{/define}`, field: `{* field: label + Input + hint + error. $f = [label, for, hint, error, formError, input: Input params, describe: own ids,
   suffix: trusted Html after the input, in a Group]. aria-describedby = own + hint + error + form error;
   aria-invalid="true" when the field or the form shows an error. *}
{define field, array $f}
{var $hintId = ($f['hint'] ?? '') !== '' ? $f['for'] . '-hint' : null}
{var $errId = ($f['error'] ?? '') !== '' ? $f['for'] . '-error' : null}
{var $in = $f['input'] ?? []}
{capture $ctl}{include '../ui/input/Input.latte', type: $in['type'] ?? '', name: $in['name'] ?? null, required: $in['required'] ?? false, id: $f['for'], class: afSkin('input'), ariaDescribedBy: afDescribe($f['describe'] ?? null, $hintId, $errId, $f['formError'] ?? null), ariaInvalid: (($f['error'] ?? '') !== '' || ($f['formError'] ?? null)) ? 'true' : null, attrs: afAttrs(($in['attrs'] ?? []) + ['data-testid' => 'field'])}{/capture}
{if ($f['suffix'] ?? '') !== ''}{capture $ctl}{include group, '2', '', '', '', [], $ctl . $f['suffix']}{/capture}{/if}
{capture $c}
{include '../ui/label/Label.latte', htmlFor: $f['for'], class: afSkin('label'), children: (string) afEsc($f['label'] ?? '')}
{$ctl}
{if $hintId}{include text, '', afText('hint'), ['id' => $hintId], afEsc($f['hint'])}{/if}
{if $errId}{include text, '', 'text-xs font-semibold text-destructive', ['id' => $errId], afEsc($f['error'])}{/if}
{/capture}
{include box, '', 'flex min-w-0 flex-col gap-2', [], $c}
{/define}` },
    jinja2: { hidden: `{#- hidden: value always emitted, an empty one included (the primitive omits only None). -#}
{%- macro hidden(name, value='') -%}
{{ prim('ui/input/input.html.j2', {'Type': 'hidden', 'Name': name, 'Value': '' if value is none else value}) }}
{%- endmacro -%}`, field: `{#- field: label + Input + hint + error. f = {label, for, hint, error, formError, input: {type, name, required, attrs},
    describe: own ids, suffix: trusted Markup after the input, in a Group}. aria-describedby = own + hint + error +
    form error; aria-invalid="true" when the field or the form shows an error. -#}
{%- macro field(f) -%}
{%- set hint_id = f.for ~ '-hint' if f.hint else none -%}
{%- set err_id = f.for ~ '-error' if f.error else none -%}
{%- set inp = f.input or {} -%}
{%- set attrs = dict(inp.attrs or {}) -%}{%- set _ = attrs.update({'data-testid': 'field'}) -%}
{%- set ctl -%}{{ prim('ui/input/input.html.j2', {'Type': inp.type, 'Name': inp.name, 'Required': inp.required or false, 'ID': f.for, 'Class': af_skin('input'), 'AriaDescribedBy': af_describe(f.describe, hint_id, err_id, f.formError), 'AriaInvalid': 'true' if (f.error or f.formError) else none, 'Attrs': af_attrs(attrs)}) }}{%- endset -%}
{%- if f.suffix -%}{%- set ctl = group('2', '', '', '', {}, ctl ~ f.suffix) -%}{%- endif -%}
{%- set c -%}
{{ prim('ui/label/label.html.j2', {'For': f.for, 'Class': af_skin('label')}, af_esc(f.label)) }}{{ ctl }}
{%- if hint_id %}{{ text('', af_text('hint'), {'id': hint_id}, af_esc(f.hint)) }}{% endif -%}
{%- if err_id %}{{ text('', 'text-xs font-semibold text-destructive', {'id': err_id}, af_esc(f.error)) }}{% endif -%}
{%- endset -%}
{{ box('', 'flex min-w-0 flex-col gap-2', {}, c) }}
{%- endmacro -%}` },
  };
}
