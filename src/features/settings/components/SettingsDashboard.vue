<script setup lang="ts">
  import BilingualStack from "@/components/BilingualStack.vue";
  import PlatformPanel from "@/components/platform/PlatformPanel.vue";
  import PlatformStatRow from "@/components/platform/PlatformStatRow.vue";
  import SettingsSelectField from "@/features/settings/components/SettingsSelectField.vue";
  import { useSettingsDashboard } from "@/features/settings/composables/useSettingsDashboard";

  const {
    hasHydrated,
    previewTemperature,
    previewTime,
    previewWind,
    reducedMotionLabel,
    reducedMotionOptions,
    reducedMotionSelection,
    temperatureOptions,
    temperatureUnit,
    timezoneOptions,
    timezonePolicy,
    updateReducedMotion,
    updateTemperatureUnit,
    updateTimezonePolicy,
    updateWindUnit,
    updateWorkspaceDefaultGroup,
    windOptions,
    windUnit,
    workspaceDefaultGroup,
    workspaceGroupOptions,
  } = useSettingsDashboard();
</script>

<template>
  <main class="container relative z-10 min-h-screen pt-28 pb-20 sm:pt-32 md:pt-40 md:pb-28">
    <section class="max-w-6xl">
      <BilingualStack
        en="Settings"
        zh="设置"
        wrapper-class="flex flex-col gap-3"
        en-class="text-[10px] md:text-xs uppercase tracking-[0.38em] font-bold text-brand-muted/75"
        zh-class="text-lg md:text-xl font-light tracking-[0.08em]"
      />

      <div class="mt-6 grid grid-cols-1 gap-8 xl:grid-cols-[1.08fr_0.92fr] xl:items-end">
        <div class="space-y-4">
          <p data-testid="settings-heading" class="text-5xl md:text-7xl font-light tracking-tighter">
            Platform preferences are now durable and visible.
          </p>
          <p class="text-3xl md:text-5xl font-light tracking-tight text-brand-muted/88">
            平台偏好现在已经可持久保存，并真正作用到界面上。
          </p>
          <div class="max-w-3xl text-sm md:text-base leading-7 text-brand-muted/70 space-y-2">
            <p>
              Units, timezone policy, reduced motion, and workspace defaults now flow through the app instead of sitting as placeholder text.
            </p>
            <p>
              温度单位、风速展示、时区策略、动效偏好和工作台默认分组都已从占位说明升级为真实偏好控制。
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <PlatformStatRow label="Preview Temp" :value="previewTemperature" tone="elevated">
            <template #default>
              <span data-testid="settings-preview-temperature" class="sr-only">{{ previewTemperature }}</span>
            </template>
          </PlatformStatRow>
          <PlatformStatRow label="Preview Wind" :value="previewWind" tone="elevated">
            <template #default>
              <span data-testid="settings-preview-wind" class="sr-only">{{ previewWind }}</span>
            </template>
          </PlatformStatRow>
          <PlatformStatRow label="Preview Time" :value="previewTime" tone="elevated">
            <template #default>
              <span data-testid="settings-preview-time" class="sr-only">{{ previewTime }}</span>
            </template>
          </PlatformStatRow>
          <PlatformStatRow
            label="Hydration"
            :value="hasHydrated ? 'Ready / 已加载' : 'Pending / 待加载'"
            tone="elevated"
          />
        </div>
      </div>
    </section>

    <section class="mt-12 grid grid-cols-1 gap-5 xl:grid-cols-2">
      <SettingsSelectField
        label="Temperature / 温度单位"
        description="Visible weather temperatures can stay in Celsius or convert into Fahrenheit across supported routes."
        test-id="temperature-unit-toggle"
        :value="temperatureUnit"
        :options="temperatureOptions"
        @change="updateTemperatureUnit"
      />
      <SettingsSelectField
        label="Wind / 风速展示"
        description="Choose between the compact wind scale language and measured speed when it exists."
        test-id="wind-unit-toggle"
        :value="windUnit"
        :options="windOptions"
        @change="updateWindUnit"
      />
      <SettingsSelectField
        label="Timezone Policy / 时区策略"
        description="Observation and forecast timestamps can follow the location itself or the current device."
        test-id="timezone-policy-toggle"
        :value="timezonePolicy"
        :options="timezoneOptions"
        @change="updateTimezonePolicy"
      />
      <SettingsSelectField
        label="Reduced Motion / 动效偏好"
        description="Motion can follow the browser, be reduced explicitly, or remain full only when the browser allows it."
        test-id="reduced-motion-toggle"
        :value="reducedMotionSelection"
        :options="reducedMotionOptions"
        @change="updateReducedMotion"
      />
      <SettingsSelectField
        label="Workspace Default / 工作台默认分组"
        description="When `/workspace` loads without a `group` query, this default lane takes over."
        test-id="workspace-default-group-toggle"
        :value="workspaceDefaultGroup"
        :options="workspaceGroupOptions"
        @change="updateWorkspaceDefaultGroup"
      />

      <PlatformPanel class="px-5 py-6 md:px-6 md:py-7">
        <p class="text-[10px] uppercase tracking-[0.32em] font-bold text-brand-muted/70">Motion State / 动效状态</p>
        <p class="mt-4 text-2xl md:text-3xl font-light tracking-tight">
          {{ reducedMotionLabel }}
        </p>
        <div class="mt-5 text-sm leading-7 text-brand-muted/68 space-y-2">
          <p>
            The browser preference still wins when it asks for reduced motion; the explicit “off” option only restores motion when the browser itself allows it.
          </p>
          <p>
            浏览器如果已经请求降低动效，页面不会被设置项强行恢复；“关闭”只会在浏览器允许完整动效时生效。
          </p>
        </div>
      </PlatformPanel>
    </section>
  </main>
</template>
