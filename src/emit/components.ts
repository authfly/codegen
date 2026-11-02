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
