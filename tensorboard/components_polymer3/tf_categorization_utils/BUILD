load("//tensorboard/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorboard:internal"])

licenses(["notice"])  # Apache 2.0

tf_ts_library(
    name = "tf_categorization_utils",
    srcs = [
        "categorizationUtils.ts",
        "tf-tag-filterer.ts",
    ],
    strict_checks = False,
    deps = [
        "//tensorboard/components_polymer3/tf_backend",
        "//tensorboard/components_polymer3/tf_backend:type",
        "//tensorboard/components_polymer3/tf_storage",
        "//tensorboard/components_polymer3/vz_sorting",
        "@npm//@polymer/decorators",
        "@npm//@polymer/iron-collapse",
        "@npm//@polymer/iron-icon",
        "@npm//@polymer/paper-input",
        "@npm//@polymer/polymer",
        "@npm//@types/lodash",
        "@npm//lodash",
    ],
)
