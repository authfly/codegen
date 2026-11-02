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
