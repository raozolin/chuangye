<template>
  <NLayoutHeader bordered class="m-l-header" id="intro-header">
    <NPageHeader>
      <template #title>
        <NMenu mode="horizontal" :options="mainMenu"></NMenu>
      </template>
      <template #extra>
        <div>
          <div class="left mr2 clickable">
            <NButtonGroup>
              <NBadge :value="unreadCount" :offset="[-8, 3]" :max="99">
                <NButton
                  circle
                  text
                  type="primary"
                  class="pr3"
                  @click="toMessages"
                >
                  <NIcon :size="28" :component="Mail"></NIcon>
                </NButton>
              </NBadge>
              <NDropdown
                size="huge"
                style="padding-left: 20px; padding-right: 20px"
                :options="optionsMenu"
                show-arrow
                @select="handleMenuSelect"
              >
                <NButton circle text type="primary">
                  <NIcon :size="28">
                    <AddCircle></AddCircle>
                  </NIcon>
                </NButton>
              </NDropdown>
            </NButtonGroup>
          </div>
        </div>
      </template>
    </NPageHeader>
  </NLayoutHeader>
</template>

<script setup lang="ts">
import {
  NLayoutHeader,
  NMenu,
  MenuOption,
  NPageHeader,
  NIcon,
  NAvatar,
  NDropdown,
  NButton,
  NInput,
  NButtonGroup,
  NBadge,
} from "naive-ui";
import { computed, h, ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  AddCircle,
  AddCircleOutline,
  DuplicateOutline,
  EnterOutline,
  LocationOutline,
  LogInOutline,
  Mail,
  MailOutline,
  ScanOutline,
  SearchCircleOutline,
} from "@vicons/ionicons5";
const { t: $t } = useI18n();
import { useRouter } from "vue-router";
const router = useRouter();

import { useUserStore } from "../store/user";
import { storeToRefs } from "pinia";
import { useMessageStore } from "../store/message";
import { useHeaderStore } from "../store/header";

const { UserAvatar, UserOnline } = storeToRefs(useUserStore());
const { unreadCount } = storeToRefs(useMessageStore());
const { Title } = storeToRefs(useHeaderStore());

const mainMenu = computed((): MenuOption[] => {
  const menu: MenuOption[] = [
    {
      label: () =>
        h(NAvatar, {
          round: true,
          src: UserAvatar.value,
          style: {
            marginTop: "8px",
          },
        }),
      key: "avatar",
      onClick: () => {
        router.push("/home");
      },
    },
    {
      label: () =>
        h(
          "div",
          {
            style: {
              fontSize: "16px",
              marginTop: "8px",
            },
          },
          Title.value
        ),
      key: "title",
    },
  ];
  return menu;
});

const optionsMenu = computed(() => {
  if (!UserOnline.value) {
    return [
      {
        label: () => $t("layout.Header.776236-6"),
        // @ts-ignore
        icon: () =>
          h(
            NIcon,
            { clsPrefix: "ion", size: 20 },
            {
              default: () => h(LogInOutline),
            }
          ),
        key: "login",
        path: "/login",
      },
    ];
  }
  return [
    {
      label: "加入组织",
      icon: () =>
        h(
          NIcon,
          { clsPrefix: "ion", size: 20 },
          {
            default: () => h(EnterOutline),
          }
        ),
      path: "/organization/search",
      key: "search_organization",
    },
    {
      label: "扫一扫",
      icon: () =>
        h(
          NIcon,
          { clsPrefix: "ion", size: 20 },
          {
            default: () => h(ScanOutline),
          }
        ),
      path: "/scanner",
      key: "scanner",
    },
    {
      label: "创建组织",
      icon: () =>
        h(
          NIcon,
          { clsPrefix: "ion", size: 20 },
          {
            default: () => h(DuplicateOutline),
          }
        ),
      path: "/organization/new",
      key: "new_organization",
    },
    {
      label: "搜索附近",
      icon: () =>
        h(
          NIcon,
          { clsPrefix: "ion", size: 20 },
          {
            default: () => h(LocationOutline),
          }
        ),
      path: "/organization/nearby",
      key: "nearby_organization",
    },
    {
      label: "综合搜索",
      icon: () =>
        h(
          NIcon,
          { clsPrefix: "ion", size: 20 },
          {
            default: () => h(SearchCircleOutline),
          }
        ),
      path: "/organization/categories",
      key: "categories_organization",
    },
  ];
});

// @ts-ignore
const handleMenuSelect = (key: string) => {
  // @ts-ignore
  const menu = optionsMenu.value.find((i) => i.key === key);
  if (menu) {
    router.push(menu.path);
  }
};

const toMessages = () => {
  router.push("/messages");
};
</script>

<style scoped>
.m-l-header {
  padding-top: 4px;
  padding-bottom: 2px;
  border: 0;
  /** bottom shadow */
  z-index: 1;
  position: relative;
  /**top radius */
}
</style>
